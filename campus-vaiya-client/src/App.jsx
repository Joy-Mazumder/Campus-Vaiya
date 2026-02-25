import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Shared/Navbar';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<h1 className="p-10 text-3xl font-bold">Welcome to CampusVaiya</h1>} />
          {}
        </Routes>
      </div>
    </Router>
  );
}

export default App;