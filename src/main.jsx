import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("CBT System error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F3F3F3] p-4 text-center">
          <div className="bg-white border-2 border-[#133E59] p-6 rounded-2xl shadow-xl max-w-md w-full space-y-4">
            <h2 className="text-lg font-bold text-[#133E59]">Memuat Aplikasi CBT...</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sistem sedang menyinkronkan data. Jika halaman belum tampil, silakan muat ulang:
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#1A936F] hover:bg-[#147C5D] text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-md cursor-pointer"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
