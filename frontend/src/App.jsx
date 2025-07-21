import { useState } from 'react'
import Header from './components/layout/Header'
import Sidebar from './components/layout/Sidebar'
import './styles/index.css' // Importa estilos base e reset
import './styles/App.css'   // Importa estilos da aplicação
import AppRoutes from './Routes'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-container">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="main-layout">
        <Sidebar isOpen={sidebarOpen} />
        <AppRoutes />
      </div>
    </div>
  )
}

export default App
