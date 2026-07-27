import { Footer } from "./components/layout/Footer/Footer";
import Navbar from "./components/layout/Navbar/Navbar";
import AppRoutes from "./routes/AppRoutes";


function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="flex-1">
        <AppRoutes />
      </main>
      <Footer/>
    </div>
  );
}

export default App;
