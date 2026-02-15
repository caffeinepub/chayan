import { useInternetIdentity } from './hooks/useInternetIdentity';
import SignInScreen from './screens/SignInScreen';
import ChatLayout from './components/ChatLayout';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <SignInScreen />;
  }

  return <ChatLayout />;
}
