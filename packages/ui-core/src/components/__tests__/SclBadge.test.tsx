import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SclBadge from '../SclBadge'; // Adjust path as necessary
import { faCoffee } from '@fortawesome/free-solid-svg-icons'; // Example icon

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt || ''} />;
  },
}));

describe('SclBadge Component', () => {
  const defaultProps = { name: 'test badge' };

  test('renders with required name prop and capitalizes it', () => {
    render(<SclBadge {...defaultProps} />);
    expect(screen.getByText('Test badge')).toBeInTheDocument();
  });

  test('applies default classes', () => {
    const { container } = render(<SclBadge {...defaultProps} />);
    const badgeElement = container.firstChild;
    expect(badgeElement).toHaveClass('baseBadge'); // from styles.baseBadge
    expect(badgeElement).toHaveClass('d-flex');
    expect(badgeElement).toHaveClass('align-items-center');
    expect(badgeElement).toHaveClass('d-inline-flex'); // default for fullWidth=false
  });

  test('applies Bootstrap variant when provided', () => {
    const { container } = render(<SclBadge {...defaultProps} variant='primary' />);
    const badgeElement = container.firstChild as HTMLElement;
    // The react-bootstrap Badge component will have the class `bg-primary`
    // We expect the SclBadge to pass this through.
    // The underlying Badge component from react-bootstrap receives the 'bg' prop.
    // We check if the rendered element (which is the Badge from react-bootstrap) has the class.
    expect(badgeElement.classList.contains('bg-primary')).toBe(true);
  });

  test('applies custom colorScheme and sets bg to "none"', () => {
    const { container } = render(<SclBadge {...defaultProps} colorScheme='custom-scheme' />);
    const badgeElement = container.firstChild as HTMLElement;
    expect(badgeElement.style.getPropertyValue('--scl-badge-current-bg')).toBe(
      'var(--scl-badge-bg-custom-scheme, var(--scl-badge-bg-color-default))'
    );
    expect(badgeElement.style.getPropertyValue('--scl-badge-current-text')).toBe(
      'var(--scl-badge-text-custom-scheme, var(--scl-badge-text-color))' // Default textStyle is 'light'
    );
    // Check that react-bootstrap's bg class is not directly applied
    expect(badgeElement.classList.contains('bg-none')).toBe(true); // 'none' is passed to react-bootstrap Badge's bg prop
  });

  test('applies custom colorScheme with dark textStyle', () => {
    const { container } = render(
      <SclBadge {...defaultProps} colorScheme='custom-dark' textStyle='dark' />
    );
    const badgeElement = container.firstChild as HTMLElement;
    expect(badgeElement.style.getPropertyValue('--scl-badge-current-bg')).toBe(
      'var(--scl-badge-bg-custom-dark, var(--scl-badge-bg-color-default))'
    );
    expect(badgeElement.style.getPropertyValue('--scl-badge-current-text')).toBe('');
    expect(badgeElement).toHaveClass('textDark');
  });

  test('renders with imgSrc', () => {
    render(<SclBadge {...defaultProps} imgSrc='/path/to/image.png' />);
    const image = screen.getByAltText('test badge icon');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/path/to/image.png');
    expect(image).toHaveAttribute('height', '16');
    expect(image).toHaveAttribute('width', '16');
  });

  test('renders with faIcon', () => {
    render(<SclBadge {...defaultProps} faIcon={faCoffee} />);
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toBeInTheDocument();
    // --- Corrected Assertion ---
    expect(icon).toHaveAttribute('data-icon', 'mug-saucer');
    expect(icon).toHaveClass('svg-inline--fa');
  });

  test('imgSrc is not rendered if faIcon is also provided', () => {
    render(<SclBadge {...defaultProps} imgSrc='/path/to/image.png' faIcon={faCoffee} />);
    const icon = screen.getByRole('img', { hidden: true });
    expect(icon).toBeInTheDocument();
    // --- Corrected Assertion ---
    expect(icon).toHaveAttribute('data-icon', 'mug-saucer');
    expect(icon).toHaveClass('svg-inline--fa');
    expect(screen.queryByAltText('test badge icon')).not.toBeInTheDocument();
  });

  test('applies textStyle="dark" class', () => {
    const { container } = render(<SclBadge {...defaultProps} textStyle='dark' />);
    expect(container.firstChild).toHaveClass('textDark'); // from styles.textDark
  });

  test('applies fullWidth classes', () => {
    const { container } = render(<SclBadge {...defaultProps} fullWidth={true} />);
    const badgeElement = container.firstChild;
    expect(badgeElement).toHaveClass('w-100');
    expect(badgeElement).toHaveClass('justify-content-center');
    expect(badgeElement).not.toHaveClass('d-inline-flex');
  });

  test('applies additional className', () => {
    const { container } = render(<SclBadge {...defaultProps} className='my-custom-class' />);
    expect(container.firstChild).toHaveClass('my-custom-class');
  });

  test('renders capitalized name correctly', () => {
    render(<SclBadge name='another badge' />);
    expect(screen.getByText('Another badge')).toBeInTheDocument();
  });

  test('when variant and colorScheme are provided, colorScheme takes precedence', () => {
    const { container } = render(
      <SclBadge {...defaultProps} variant='success' colorScheme='priority' />
    );
    const badgeElement = container.firstChild as HTMLElement;
    expect(badgeElement.style.getPropertyValue('--scl-badge-current-bg')).toContain('priority');
    expect(badgeElement.classList.contains('bg-success')).toBe(false); // Bootstrap variant class should not be there
    expect(badgeElement.classList.contains('bg-none')).toBe(true); // 'none' is passed to react-bootstrap Badge's bg prop
  });

  test('uses default text color from CSS variables when textStyle is light and colorScheme is active', () => {
    const { container } = render(
      <SclBadge {...defaultProps} colorScheme='bright' textStyle='light' />
    );
    const badgeElement = container.firstChild as HTMLElement;
    expect(badgeElement.style.getPropertyValue('--scl-badge-current-text')).toBe(
      'var(--scl-badge-text-bright, var(--scl-badge-text-color))'
    );
    expect(badgeElement).not.toHaveClass('textDark');
  });
});
