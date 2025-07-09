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

describe('useSync Hook', () => {
  const mockDbs = { settings: 'settings-db', filament: 'filament-db' };

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
      data: { token: 'new-key', userData: { email: 'test@example.com' }, keyType: 'personal' },
    });
    (checkTimestamp as jest.Mock).mockResolvedValue({
      status: 'success',
      timestamp: new Date().toISOString(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize and load data correctly', async () => {
    const { result } = renderHook(() => useSync(''));
    await waitFor(() => expect(result.current.initialType).not.toBe('loading'));
    expect(result.current.isSpinning).toBe(false);
    expect(result.current.initialType).toBe('');
  });

  it('should handle input change', async () => {
    const { result } = renderHook(() => useSync(''));
    await waitFor(() => expect(result.current.initialType).not.toBe('loading'));
    act(() => {
      result.current.handleInputChange(result.current.setSyncEmail)({
        target: { value: 'test@example.com' },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    expect(result.current.syncEmail).toBe('test@example.com');
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

  it('should handle existing key setup', async () => {
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
  });

  // --- FIXED TEST ---
  it('should push data successfully', async () => {
    // Set up the hook with initial data that includes a sync key
    const initialSyncData = { syncKey: 'a-valid-sync-key', needsVerification: false };
    (getDocumentByColumn as jest.Mock).mockResolvedValue({
      value: JSON.stringify(initialSyncData),
    });

    const { result } = renderHook(() => useSync(''));

    // Wait for the hook to finish its initial data fetch and be ready
    await waitFor(() => expect(result.current.initialType).toBe('engaged'));

    await act(async () => {
      await result.current.pushSyncData(true); // Force push to bypass cooldown
    });

    expect(pushData).toHaveBeenCalled();
    expect(result.current.alertMessage).toBe('Data has been synced to the cloud!');
    expect(result.current.alertVariant).toBe('success');
  });

  // --- FIXED TEST ---
  it('should pull and merge data', async () => {
    // Set up the hook with an existing sync key
    const initialSyncData = { syncKey: 'a-valid-sync-key', needsVerification: false };
    (getDocumentByColumn as jest.Mock).mockResolvedValue({
      value: JSON.stringify(initialSyncData),
    });

    // Mock the data that will be "pulled" from the server
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

    // Wait for the hook to initialize with the data
    await waitFor(() => expect(result.current.initialType).toBe('engaged'));

    await act(async () => {
      await result.current.pullSyncData(false); // Not forcing, so it merges
    });

    await waitFor(() => {
      expect(pullData).toHaveBeenCalled();
      expect(importDB).toHaveBeenCalled();
      expect(result.current.alertMessage).toBe('Data has been pulled and merged with local data!');
    });
  });

  it('should check timestamp and pull if remote is newer', async () => {
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
    await waitFor(() => expect(pullData).toHaveBeenCalled());
  });

  it('should remove sync settings', async () => {
    window.confirm = jest.fn(() => true);
    const { result } = renderHook(() => useSync(''));
    await waitFor(() => expect(result.current.initialType).not.toBe('loading'));

    await act(async () => {
      await result.current.removeSync();
    });

    expect(saveSettings).toHaveBeenCalledWith(expect.anything(), { 'scl-sync': '' });
    expect(result.current.initialType).toBe('');
    expect(result.current.alertMessage).toBe('Sync Removed');
  });
});
