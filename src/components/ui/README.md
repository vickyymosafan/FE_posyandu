# UI Components Library

This directory contains reusable UI components for the Posyandu Management System.

## Components Overview

### 1. Button (`button.tsx`)
Enhanced button component with multiple variants and states.

**Features:**
- Variants: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`, `success`, `warning`
- Sizes: `xs`, `sm`, `default`, `lg`, `icon`
- Loading state support
- Left and right icon support

**Usage:**
```tsx
import { Button } from '@/components/ui/button';

<Button variant="success" size="lg" loading>
  Save Data
</Button>
```

### 2. Input (`input.tsx`)
Enhanced input component with validation states and icons.

**Features:**
- Error and success states
- Helper text support
- Left and right icon support
- Label support
- Textarea variant included

**Usage:**
```tsx
import { Input, Textarea } from '@/components/ui/input';

<Input
  label="Email"
  error={hasError}
  helperText="Please enter a valid email"
  leftIcon={<EmailIcon />}
/>
```

### 3. Modal (`modal.tsx`)
Modal component for dialogs and confirmations.

**Features:**
- Multiple sizes: `sm`, `md`, `lg`, `xl`, `full`
- Confirmation modal variant
- Alert modal variant
- Keyboard and overlay close support

**Usage:**
```tsx
import { Modal, ConfirmModal, AlertModal } from '@/components/ui/modal';

<Modal isOpen={isOpen} onClose={onClose} title="Edit Data">
  <p>Modal content here</p>
</Modal>

<ConfirmModal
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  variant="destructive"
  message="Are you sure you want to delete this item?"
/>
```

### 4. Table (`table.tsx`)
Data table component with sorting and pagination.

**Features:**
- Sortable columns
- Pagination support
- Row selection
- Custom cell rendering
- Loading and empty states

**Usage:**
```tsx
import { DataTable } from '@/components/ui/table';

const columns = [
  { key: 'name', title: 'Name', sortable: true },
  { key: 'email', title: 'Email', sortable: true },
  {
    key: 'actions',
    title: 'Actions',
    render: (_, row) => (
      <Button size="sm" onClick={() => edit(row)}>Edit</Button>
    )
  }
];

<DataTable
  data={users}
  columns={columns}
  pagination
  pageSize={10}
  selectable
  onSelectionChange={setSelectedRows}
/>
```

### 5. Loading (`loading.tsx`)
Loading components and skeleton states.

**Features:**
- Multiple loading spinner sizes
- Skeleton components for different layouts
- Loading states for specific components

**Usage:**
```tsx
import { 
  Loading, 
  LoadingSpinner, 
  Skeleton, 
  SkeletonCard,
  SkeletonTable 
} from '@/components/ui/loading';

<Loading size="lg" />
<LoadingSpinner text="Loading data..." />
<SkeletonCard />
<SkeletonTable rows={5} columns={4} />
```

### 6. Toast (`toast.tsx`)
Toast notification system with react-hot-toast integration.

**Features:**
- Multiple toast types: success, error, warning, info, loading
- Promise-based toasts
- Pre-configured Indonesian messages
- Toast provider component

**Usage:**
```tsx
import { showToast, toastMessages, ToastProvider } from '@/components/ui/toast';

// In your app root
<ToastProvider />

// In components
showToast.success(toastMessages.success.save);
showToast.error('Custom error message');

// Promise toast
showToast.promise(
  saveData(),
  {
    loading: 'Saving...',
    success: 'Data saved!',
    error: 'Failed to save'
  }
);
```

## Installation & Setup

1. All components are already installed and configured
2. Add the ToastProvider to your app root:

```tsx
// In your layout or app component
import { ToastProvider } from '@/components/ui/toast';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
```

## Testing

Basic tests are included in `__tests__/components.test.tsx`. Run tests with:

```bash
npm test
```

## Demo

Visit `/ui-demo` to see all components in action with interactive examples.

## Styling

All components use Tailwind CSS classes and follow the design system:
- Primary color: Blue (blue-600)
- Success color: Green (green-600)
- Error color: Red (red-600)
- Warning color: Yellow (yellow-600)
- Gray scale for neutral elements

## Accessibility

All components follow accessibility best practices:
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Color contrast compliance

## Contributing

When adding new components:
1. Follow the existing naming conventions
2. Include TypeScript interfaces
3. Add proper documentation
4. Include basic tests
5. Update the index.ts exports
6. Add examples to the demo page