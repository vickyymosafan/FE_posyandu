// Basic tests for UI components
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../button';
import { Input } from '../input';
import { Modal } from '../modal';
import { Loading } from '../loading';

describe('UI Components', () => {
  describe('Button', () => {
    it('renders button with text', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('handles click events', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      fireEvent.click(screen.getByText('Click me'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('shows loading state', () => {
      render(<Button loading>Loading</Button>);
      expect(screen.getByText('Loading')).toBeInTheDocument();
    });

    it('applies variant classes', () => {
      render(<Button variant="destructive">Delete</Button>);
      const button = screen.getByText('Delete');
      expect(button).toHaveClass('bg-red-600');
    });
  });

  describe('Input', () => {
    it('renders input with label', () => {
      render(<Input label="Test Input" />);
      expect(screen.getByText('Test Input')).toBeInTheDocument();
    });

    it('shows error state', () => {
      render(<Input error helperText="Error message" />);
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    it('handles value changes', () => {
      const handleChange = jest.fn();
      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });
      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('Modal', () => {
    it('renders when open', () => {
      render(
        <Modal isOpen onClose={() => {}} title="Test Modal">
          Modal content
        </Modal>
      );
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      render(
        <Modal isOpen={false} onClose={() => {}} title="Test Modal">
          Modal content
        </Modal>
      );
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    it('calls onClose when close button is clicked', () => {
      const handleClose = jest.fn();
      render(
        <Modal isOpen onClose={handleClose} title="Test Modal">
          Modal content
        </Modal>
      );
      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading', () => {
    it('renders loading spinner', () => {
      render(<Loading />);
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('applies size classes', () => {
      render(<Loading size="lg" />);
      const spinner = document.querySelector('.h-8.w-8');
      expect(spinner).toBeInTheDocument();
    });
  });
});