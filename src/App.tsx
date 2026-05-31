import { Navigate, Route, Routes } from 'react-router-dom'

import { AppShell } from '@/components/layout/app-shell'
import { HomePage } from '@/pages/HomePage'
import { SpellCompendiumPage } from '@/pages/SpellCompendiumPage'

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/grimorio" element={<SpellCompendiumPage />} />
        <Route path="/grimorio/:spellId" element={<SpellCompendiumPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}

export default App
