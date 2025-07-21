function MainContent() {
  return (
    <main className={'main-content'}>
      <div className="page-container">
        <h1 className="page-title">Dashboard</h1>
        
        <div className="grid grid-cols-1 grid-cols-md-2 grid-cols-lg-3" style={{ marginBottom: '2rem' }}>
          <div className="card">
            <h2 className="card-title">Tarefas Pendentes</h2>
            <p className="card-metric card-metric-blue">5</p>
          </div>
          
          <div className="card">
            <h2 className="card-title">Hábitos Ativos</h2>
            <p className="card-metric card-metric-purple">8</p>
          </div>
          
          <div className="card">
            <h2 className="card-title">Rotinas Hoje</h2>
            <p className="card-metric card-metric-blue">3</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 grid-cols-lg-2">
          <div className="card">
            <h2 className="section-title">Tarefas Recentes</h2>
            <ul className="list">
              {[1, 2, 3].map((item) => (
                <li key={item} className="list-item">
                  <span>Tarefa exemplo #{item}</span>
                  <button className="btn btn-primary btn-xs">Concluir</button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="card">
            <h2 className="section-title">Hábitos do Dia</h2>
            <ul className="list">
              {[1, 2, 3].map((item) => (
                <li key={item} className="list-item">
                  <span>Hábito exemplo #{item}</span>
                  <div className="habit-progress">
                    {[1, 2, 3, 4, 5].map((day) => (
                      <div 
                        key={day} 
                        className={`habit-dot ${day <= 3 ? 'completed' : ''}`}
                      />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}

export default MainContent
