import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SclCard from '../SclCard';

// Mock next/link
jest.mock('next/link', () => {
  const MockLink = ({ children, href, passHref, ...rest }: any) => {
    let childElement = children;
    if (passHref && React.isValidElement(children)) {
      childElement = React.cloneElement(children as React.ReactElement<any>, { href, ...rest });
    } else {
      return (
        <a href={href} {...rest}>
          {children}
        </a>
      );
    }
    return childElement;
  };
  return MockLink;
});

describe('SclCard Component', () => {
  const defaultProps = {
    title: 'Test Card Title',
    variant: 'primary',
    text: 'This is some test text for the card body.',
    buttons: [
      { link: '/test-link-1', disabled: false, btnText: 'Button 1' },
      { link: '/test-link-2', disabled: true, btnText: 'Button 2 (Disabled)' },
    ],
  };

  test('renders the card with title and text', () => {
    render(<SclCard {...defaultProps} />);
    // Check for the Card.Title (React Bootstrap renders it as a div with class 'card-title')
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.title)).toHaveClass('card-title');

    // Check for the Card.Text (React Bootstrap renders it as a p with class 'card-text' or just a p/div)
    expect(screen.getByText(defaultProps.text)).toBeInTheDocument();
  });

  test('renders the correct number of buttons', () => {
    render(<SclCard {...defaultProps} />);
    // Buttons are rendered by React Bootstrap's Button component
    // We look for elements with role 'button'
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(defaultProps.buttons.length);
  });

  test('renders buttons with correct text, links, variant, and disabled state', () => {
    render(<SclCard {...defaultProps} />);
    // In our SclCard, the <Button> from react-bootstrap is wrapped by <Link passHref>.
    // This means the <Button> itself becomes an <a> tag with role="button".
    const renderedButtons = screen.getAllByRole('button');

    defaultProps.buttons.forEach((buttonData, index) => {
      const buttonElement = renderedButtons[index] as HTMLAnchorElement; // Cast to HTMLAnchorElement
      expect(buttonElement).toHaveTextContent(buttonData.btnText);

      // The buttonElement itself is the anchor due to passHref
      expect(buttonElement).toHaveAttribute('href', buttonData.link);

      // Check variant (React Bootstrap buttons get class like 'btn-primary')
      expect(buttonElement).toHaveClass(`btn-${defaultProps.variant}`);
      expect(buttonElement).toHaveClass('btn-sm'); // Size is hardcoded to 'sm'

      // Check disabled state
      // For <a> tags acting as buttons, check aria-disabled and the 'disabled' class
      if (buttonData.disabled) {
        expect(buttonElement).toHaveAttribute('aria-disabled', 'true');
        expect(buttonElement).toHaveClass('disabled');
      } else {
        expect(buttonElement).not.toHaveAttribute('aria-disabled', 'true');
        expect(buttonElement).not.toHaveClass('disabled');
      }
    });
  });

  test('applies correct styling classes to the Card', () => {
    const { container } = render(<SclCard {...defaultProps} />);
    // The Card component is the root element rendered by SclCard
    // React Bootstrap Card renders a div with class 'card'
    const cardElement = container.querySelector('.card');
    expect(cardElement).toHaveStyle('width: 18rem');
    expect(cardElement).toHaveClass('mx-auto');
    expect(cardElement).toHaveClass('h-100');
    expect(cardElement).toHaveClass('d-flex');
    expect(cardElement).toHaveClass('flex-column');
  });

  test('Card.Body has correct flex classes', () => {
    const { container } = render(<SclCard {...defaultProps} />);
    const cardBodyElement = container.querySelector('.card-body');
    expect(cardBodyElement).toHaveClass('d-flex');
    expect(cardBodyElement).toHaveClass('flex-column');
    expect(cardBodyElement).toHaveClass('flex-grow-1');
  });

  test('Button container has d-grid and gap-2 classes', () => {
    render(<SclCard {...defaultProps} />);
    // The div wrapping the buttons
    // Find a button, then its parent (which is the Link/<a>), then that parent's parent (the div)
    const button1 = screen.getByRole('button', { name: 'Button 1' }); // Gets the <a> tag
    const buttonContainer = button1.parentElement;

    expect(buttonContainer).toHaveClass('d-grid');
    expect(buttonContainer).toHaveClass('gap-2');
    expect(buttonContainer).toHaveClass('mt-auto');
  });

  test('handles empty buttons array gracefully', () => {
    render(<SclCard {...defaultProps} buttons={[]} />);
    const buttons = screen.queryAllByRole('button');
    expect(buttons).toHaveLength(0);
    // Ensure the component doesn't crash and renders title/text
    expect(screen.getByText(defaultProps.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProps.text)).toBeInTheDocument();
  });
});
