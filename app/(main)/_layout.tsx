import { Slot } from 'expo-router';
import { ThreeColumnLayout } from '../../components/layout/ThreeColumnLayout';
import { SidebarProvider, useSidebar } from '../../components/layout/SidebarContext';
import { Sidebar } from '../../components/layout/Sidebar';

function MainLayoutInner() {
  const { content } = useSidebar();
  return (
    <ThreeColumnLayout sidebar={content ? <Sidebar>{content}</Sidebar> : undefined}>
      <Slot />
    </ThreeColumnLayout>
  );
}

export default function MainLayout() {
  return (
    <SidebarProvider>
      <MainLayoutInner />
    </SidebarProvider>
  );
}
