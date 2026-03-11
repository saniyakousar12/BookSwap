import { Navbar } from '../common/Navbar';
import { Footer } from '../common/Footer';

export const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar at top */}
      <Navbar />

      {/* Main content area - grows to fill available space */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer at bottom */}
      <Footer />
    </div>
  );
};