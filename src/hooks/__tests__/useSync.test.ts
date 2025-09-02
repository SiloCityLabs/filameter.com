import { renderHook, act, waitFor } from '@testing-library/react';
import { useSync } from '../useSync';
import { getDocumentByColumn } from '@silocitypages/data-access';
import saveSettings from '../../helpers/database/settings/saveSettings';
import { useDatabase } from '../../contexts/DatabaseContext';
import { exportDB } from '../../helpers/exportDB';
import { importDB } from '../../helpers/importDB';
import { isValidEmail } from '../../helpers/isValidEmail';
import { setupSyncByEmail } from '../../helpers/sync/setupSyncByEmail';
import { setupSyncByKey } from '../../helpers/sync/setupSyncByKey';
import { pushData } from '../../helpers/sync/pushData';
import { pullData } from '../../helpers/sync/pullData';
import { checkTimestamp } from '../../helpers/sync/checkTimestamp';
import { forgotSyncKey } from '../../helpers/sync/forgotSyncKey';
import { mergeSyncData } from '../../helpers/sync/mergeSyncData';

// Mock dependencies
jest.mock('@silocitypages/data-access', () => ({ getDocumentByColumn: jest.fn() }));
jest.mock('../../helpers/database/settings/saveSettings', () => jest.fn());
jest.mock('../../contexts/DatabaseContext', () => ({ useDatabase: jest.fn() }));
jest.mock('../../helpers/exportDB', () => ({ exportDB: jest.fn() }));
jest.mock('../../helpers/importDB', () => ({ importDB: jest.fn() }));
jest.mock('../../helpers/isValidEmail', () => ({ isValidEmail: jest.fn() }));
jest.mock('../../helpers/sync/setupSyncByEmail', () => ({ setupSyncByEmail: jest.fn() }));
jest.mock('../../helpers/sync/setupSyncByKey', () => ({ setupSyncByKey: jest.fn() }));
jest.mock('../../helpers/sync/pushData', () => ({ pushData: jest.fn() }));
jest.mock('../../helpers/sync/pullData', () => ({ pullData: jest.fn() }));
jest.mock('../../helpers/sync/checkTimestamp', () => ({ checkTimestamp: jest.fn() }));
jest.mock('../../helpers/sync/forgotSyncKey', () => ({ forgotSyncKey: jest.fn() }));
jest.mock('../../helpers/sync/mergeSyncData', () => ({ mergeSyncData: jest.fn() }));

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('useSync Hook', () => {
  const mockDbs = { settings: 'settings-db', filament: 'filament-db' };

  beforeAll(() => {
    jest.useFakeTimers();
  });

  beforeEach(() => {
    (useDatabase as jest.Mock).mockReturnValue({ dbs: mockDbs, isReady: true });
    (getDocumentByColumn as jest.Mock).mockResolvedValue(null);
    (exportDB as jest.Mock).mockResolvedValue({ local: [], regular: [] });
    (saveSettings as jest.Mock).mockResolvedValue(undefined);
    (isValidEmail as jest.Mock).mockReturnValue(true);
    (pushData as jest.Mock).mockResolvedValue({ status: 'success' });
    (pullData as jest.Mock).mockResolvedValue({
      status: 'success',
      data: { data: { local: [], regular: [] } },
    });
    (setupSyncByEmail as jest.Mock).mockResolvedValue({
      status: 'message',
      msg: 'Verification email sent.',
    });
    (setupSyncByKey as jest.Mock).mockResolvedValue({
      status: 'success',
      data: {
        token: 'new-key',
        userData: { email: 'test@example.com' },
        keyType: 'personal',
        data: { local: [], regular: [] },
      },
    });
    (checkTimestamp as jest.Mock).mockResolvedValue({
      status: 'success',
      timestamp: new Date().toISOString(),
    });
    (forgotSyncKey as jest.Mock).mockResolvedValue({
      status: 'message',
      msg: 'Check your email for your code',
    });
    (mergeSyncData as jest.Mock).mockImplementation((local, server) => server);
    localStorage.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should initialize and load data correctly', async () => {
    const { result } = renderHook(() => useSync(''));
    await waitFor(() => expect(result.current.initialType).not.toBe('loading'));
    expect(result.current.isSpinning).toBe(false);
    expect(result.current.initialType).toBe('');
  });

  it('should create sync with a valid email', async () => {
    const { result } = renderHook(() => useSync(''));
    await waitFor(() => expect(result.current.initialType).not.toBe('loading'));

    act(() => {
      result.current.setSyncEmail('test@example.com');
    });

    await act(async () => {
      await result.current.createSync();
    });

    expect(setupSyncByEmail).toHaveBeenCalledWith('test@example.com');
    expect(result.current.initialType).toBe('needs-verification');
    expect(result.current.alertMessage).toBe('Verification email sent.');
  });

  it('should handle existing key setup and perform initial sync', async () => {
    const { result } = renderHook(() => useSync(''));
    await waitFor(() => expect(result.current.initialType).not.toBe('loading'));

    act(() => {
      result.current.setSyncKey('existing-key');
    });

    await act(async () => {
      await result.current.existingKey();
    });

    expect(setupSyncByKey).toHaveBeenCalledWith('existing-key');
    expect(result.current.initialType).toBe('engaged');
    await waitFor(() => {
      expect(pullData).toHaveBeenCalledWith('new-key');
      expect(pushData).toHaveBeenCalled();
      expect(result.current.alertMessage).toBe(
        'Sync complete: Data successfully pulled and pushed.'
      );
    });
  });

  it('should force push data successfully', async () => {
    const initialSyncData = { syncKey: 'a-valid-sync-key', needsVerification: false };
    (getDocumentByColumn as jest.Mock).mockResolvedValue({
      value: JSON.stringify(initialSyncData),
    });

    const { result } = renderHook(() => useSync(''));
    await waitFor(() => expect(result.current.initialType).toBe('engaged'));

    await act(async () => {
      await result.current.forcePush();
    });

    expect(pushData).toHaveBeenCalled();
    expect(result.current.alertMessage).toBe('Data has been pushed to the cloud!');
    expect(result.current.alertVariant).toBe('success');
  });

  it('should force pull and merge data', async () => {
    const initialSyncData = { syncKey: 'a-valid-sync-key', needsVerification: false };
    (getDocumentByColumn as jest.Mock).mockResolvedValue({
      value: JSON.stringify(initialSyncData),
    });

    const serverData = {
      status: 'success',
      data: {
        token: 'a-valid-sync-key',
        keyType: 'personal',
        data: { local: [], regular: [{ _id: '1', name: 'Test PLA' }] },
      },
    };
    (pullData as jest.Mock).mockResolvedValue(serverData);

    const { result } = renderHook(() => useSync(''));
    await waitFor(() => expect(result.current.initialType).toBe('engaged'));

    await act(async () => {
      await result.current.forcePull();
    });

    await waitFor(() => {
      expect(pullData).toHaveBeenCalled();
      expect(importDB).toHaveBeenCalled();
      expect(result.current.alertMessage).toBe('Data has been pulled and merged locally!');
    });
  });

  it('should check timestamp and sync if remote is newer', async () => {
    const olderDate = new Date(Date.now() - 100000).toISOString();
    const newerDate = new Date().toISOString();

    (getDocumentByColumn as jest.Mock).mockResolvedValue({
      value: JSON.stringify({ syncKey: 'a-sync-key', lastSynced: olderDate }),
    });
    (checkTimestamp as jest.Mock).mockResolvedValue({ status: 'success', timestamp: newerDate });

    const { result } = renderHook(() => useSync(''));
    await waitFor(() => expect(result.current.initialType).toBe('engaged'));

    await act(async () => {
      await result.current.checkSyncTimestamp();
    });

    expect(checkTimestamp).toHaveBeenCalled();
    await waitFor(() => expect(pullData).toHaveBeenCalledWith('a-sync-key'));
    await waitFor(() => expect(pushData).toHaveBeenCalled());
  });

  it('should check timestamp and show warning if local is up-to-date', async () => {
    const newerDate = new Date().toISOString();
    const olderDate = new Date(Date.now() - 100000).toISOString();

    (getDocumentByColumn as jest.Mock).mockResolvedValue({
      value: JSON.stringify({ syncKey: 'a-sync-key', lastSynced: newerDate }),
    });
    (checkTimestamp as jest.Mock).mockResolvedValue({ status: 'success', timestamp: olderDate });

    const { result } = renderHook(() => useSync(''));
    await waitFor(() => expect(result.current.initialType).toBe('engaged'));

    await act(async () => {
      await result.current.checkSyncTimestamp();
    });

    expect(checkTimestamp).toHaveBeenCalled();
    expect(pullData).not.toHaveBeenCalled();
    expect(result.current.alertVariant).toBe('warning');
    expect(result.current.alertMessage).toBe('Your data is already up-to-date with the server.');
  });

  it('should remove sync settings and clear cooldown', async () => {
    window.confirm = jest.fn(() => true);
    localStorage.setItem('scl-last-sync-timestamp', Date.now().toString());

    const { result } = renderHook(() => useSync(''));
    await waitFor(() => expect(result.current.initialType).not.toBe('loading'));

    await act(async () => {
      await result.current.removeSync();
    });

    expect(saveSettings).toHaveBeenCalledWith(expect.anything(), { 'scl-sync': '' });
    expect(result.current.initialType).toBe('');
    expect(result.current.alertMessage).toBe('Sync Removed');
    expect(localStorage.getItem('scl-last-sync-timestamp')).toBeNull();
  });

  it('should bypass cooldown for forced actions but enforce it for regular syncs', async () => {
    const initialSyncData = { syncKey: 'a-valid-sync-key', needsVerification: false };
    (getDocumentByColumn as jest.Mock).mockResolvedValue({
      value: JSON.stringify(initialSyncData),
    });

    const { result } = renderHook(() => useSync(''));
    await waitFor(() => expect(result.current.initialType).toBe('engaged'));

    // 1. Perform a successful forced action to start the cooldown
    await act(async () => {
      await result.current.forcePush();
    });

    expect(result.current.syncCooldown).toBe(5);
    expect(pushData).toHaveBeenCalledTimes(1);
    expect(result.current.alertMessage).toBe('Data has been pushed to the cloud!');

    // 2. Try another forced action immediately; it should bypass the cooldown and succeed
    await act(async () => {
      await result.current.forcePull();
    });
    expect(pullData).toHaveBeenCalledTimes(1);
    expect(result.current.alertMessage).toBe('Data has been pulled and merged locally!');

    // 3. Try a non-forced action (check timestamp); it should be blocked by the cooldown
    await act(async () => {
      await result.current.checkSyncTimestamp();
    });
    expect(checkTimestamp).not.toHaveBeenCalled();
    expect(result.current.alertMessage).toBe(
      `Please wait ${result.current.syncCooldown} seconds between syncs.`
    );

    // 4. Advance time past the cooldown
    act(() => {
      jest.advanceTimersByTime(6000);
    });
    await waitFor(() => expect(result.current.syncCooldown).toBe(0));

    // 5. Try a non-forced action again, it should now succeed
    await act(async () => {
      await result.current.checkSyncTimestamp();
    });
    expect(checkTimestamp).toHaveBeenCalledTimes(1);
  });
});
