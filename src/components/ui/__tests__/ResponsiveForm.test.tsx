import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
  ResponsiveForm,
  ResponsiveFormField,
  ResponsiveFormGroup,
  ResponsiveFormActions,
  ResponsiveFormSection
} from '../ResponsiveForm';
import { Input } from '../input';
import { Button } from '../button';

// Mock useBreakpoint hook
jest.mock('../../../lib/hooks/useBreakpoint', () => ({
  useBreakpoint: () => ({
    currentBreakpoint: 'desktop',
    screenSize: { width: 1024, height: 768 },
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    orientation: 'landscape',
    touchDevice: false
  })
}));

describe('ResponsiveForm Components', () => {
  describe('ResponsiveForm', () => {
    it('renders form with correct classes', () => {
      const { container } = render(
        <ResponsiveForm>
          <div>Test content</div>
        </ResponsiveForm>
      );

      const form = container.querySelector('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveClass('grid');
    });

    it('handles form submission', async () => {
      const handleSubmit = jest.fn((e) => e.preventDefault());
      
      render(
        <ResponsiveForm onSubmit={handleSubmit}>
          <Button type="submit">Submit</Button>
        </ResponsiveForm>
      );

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledTimes(1);
      });
    });

    it('applies different layouts based on layout prop', () => {
      const { rerender, container } = render(
        <ResponsiveForm layout="single">
          <div>Test content</div>
        </ResponsiveForm>
      );

      let form = container.querySelector('form');
      expect(form).toHaveClass('grid-cols-1');

      rerender(
        <ResponsiveForm layout="multi">
          <div>Test content</div>
        </ResponsiveForm>
      );

      form = container.querySelector('form');
      expect(form).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-3');
    });
  });

  describe('ResponsiveFormField', () => {
    it('renders field with correct span classes', () => {
      const { container } = render(
        <ResponsiveFormField 
          span={{ mobile: 1, tablet: 2, desktop: 3 }}
        >
          <Input label="Test Input" />
        </ResponsiveFormField>
      );

      const field = container.firstChild;
      expect(field).toBeInTheDocument();
      expect(field).toHaveClass('col-span-3'); // Desktop breakpoint
    });

    it('applies full width when fullWidth is true', () => {
      const { container } = render(
        <ResponsiveFormField fullWidth>
          <Input label="Test Input" />
        </ResponsiveFormField>
      );

      const field = container.firstChild;
      expect(field).toHaveClass('col-span-3'); // Desktop full width
    });
  });

  describe('ResponsiveFormGroup', () => {
    it('renders group with title and description', () => {
      render(
        <ResponsiveFormGroup
          title="Test Group"
          description="Test description"
        >
          <div>Group content</div>
        </ResponsiveFormGroup>
      );

      expect(screen.getByText('Test Group')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
      expect(screen.getByText('Group content')).toBeInTheDocument();
    });

    it('renders without title and description', () => {
      render(
        <ResponsiveFormGroup>
          <div>Group content</div>
        </ResponsiveFormGroup>
      );

      expect(screen.getByText('Group content')).toBeInTheDocument();
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('ResponsiveFormActions', () => {
    it('renders actions with correct alignment', () => {
      render(
        <ResponsiveFormActions alignment="center">
          <Button>Action 1</Button>
          <Button>Action 2</Button>
        </ResponsiveFormActions>
      );

      const button1 = screen.getByRole('button', { name: 'Action 1' });
      const actions = button1.parentElement;
      expect(actions).toHaveClass('justify-center');
    });

    it('renders stacked layout when stacked is true', () => {
      render(
        <ResponsiveFormActions stacked>
          <Button>Action 1</Button>
          <Button>Action 2</Button>
        </ResponsiveFormActions>
      );

      const button1 = screen.getByRole('button', { name: 'Action 1' });
      const actions = button1.parentElement;
      expect(actions).toHaveClass('flex-col');
    });
  });

  describe('ResponsiveFormSection', () => {
    it('renders section with title and description', () => {
      render(
        <ResponsiveFormSection
          title="Test Section"
          description="Test section description"
        >
          <div>Section content</div>
        </ResponsiveFormSection>
      );

      expect(screen.getByText('Test Section')).toBeInTheDocument();
      expect(screen.getByText('Test section description')).toBeInTheDocument();
      expect(screen.getByText('Section content')).toBeInTheDocument();
    });

    it('handles collapsible functionality', async () => {
      render(
        <ResponsiveFormSection
          title="Collapsible Section"
          collapsible
          defaultExpanded={true}
        >
          <div>Section content</div>
        </ResponsiveFormSection>
      );

      // Content should be visible initially
      expect(screen.getByText('Section content')).toBeInTheDocument();

      // Click the toggle button
      const toggleButton = screen.getByLabelText('Tutup section');
      fireEvent.click(toggleButton);

      // Content should be hidden
      await waitFor(() => {
        expect(screen.queryByText('Section content')).not.toBeInTheDocument();
      });

      // Click again to expand
      const expandButton = screen.getByLabelText('Buka section');
      fireEvent.click(expandButton);

      // Content should be visible again
      await waitFor(() => {
        expect(screen.getByText('Section content')).toBeInTheDocument();
      });
    });

    it('starts collapsed when defaultExpanded is false', () => {
      render(
        <ResponsiveFormSection
          title="Collapsed Section"
          collapsible
          defaultExpanded={false}
        >
          <div>Section content</div>
        </ResponsiveFormSection>
      );

      // Content should not be visible initially
      expect(screen.queryByText('Section content')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Buka section')).toBeInTheDocument();
    });
  });

  describe('Integration Test', () => {
    it('renders complete form with all components', () => {
      const handleSubmit = jest.fn((e) => e.preventDefault());

      render(
        <ResponsiveForm onSubmit={handleSubmit}>
          <ResponsiveFormSection title="Personal Info">
            <ResponsiveFormField fullWidth>
              <Input label="Full Name" placeholder="Enter your name" />
            </ResponsiveFormField>
            
            <ResponsiveFormField>
              <Input label="Email" type="email" placeholder="Enter email" />
            </ResponsiveFormField>
            
            <ResponsiveFormField>
              <Input label="Phone" type="tel" placeholder="Enter phone" />
            </ResponsiveFormField>
          </ResponsiveFormSection>

          <ResponsiveFormActions alignment="right">
            <Button type="button" variant="outline">Cancel</Button>
            <Button type="submit">Submit</Button>
          </ResponsiveFormActions>
        </ResponsiveForm>
      );

      // Check all elements are rendered
      expect(screen.getByText('Personal Info')).toBeInTheDocument();
      expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Phone')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();

      // Test form submission
      const submitButton = screen.getByRole('button', { name: 'Submit' });
      fireEvent.click(submitButton);
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });
  });
});