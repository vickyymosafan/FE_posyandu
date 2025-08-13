// UI Components Demo Page
import UIComponentsDemo from '@/components/ui/demo';
import { ToastProvider } from '@/components/ui/toast';

export default function UIDemo() {
  return (
    <div>
      <ToastProvider />
      <UIComponentsDemo />
    </div>
  );
}