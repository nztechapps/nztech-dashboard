import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useTareas() {
  const [tareas, setTareas] = useState([])
  const [bloques, setBloques] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const [bloquesRes, tareasRes] = await Promise.all([
        supabase.from('bloques_tareas').select('*').order('orden', { ascending: true }),
        supabase.from('tareas').select('*').order('orden', { ascending: true }),
      ])
      if (bloquesRes.error) throw bloquesRes.error
      if (tareasRes.error) throw tareasRes.error
      setBloques(bloquesRes.data || [])
      setTareas(tareasRes.data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addBloque = async ({ nombre, color }) => {
    const maxOrden = bloques.length > 0 ? Math.max(...bloques.map((b) => b.orden)) + 1 : 0
    const { data, error: err } = await supabase
      .from('bloques_tareas')
      .insert({ nombre, color, orden: maxOrden })
      .select()
      .single()
    if (err) throw err
    setBloques((prev) => [...prev, data])
    return data
  }

  const archivarBloque = async (id) => {
    const { data, error: err } = await supabase
      .from('bloques_tareas')
      .update({ archivado: true })
      .eq('id', id)
      .select()
      .single()
    if (err) throw err
    setBloques((prev) => prev.map((b) => (b.id === id ? data : b)))
    return data
  }

  const updateTarea = async (id, updates) => {
    const { data, error: err } = await supabase
      .from('tareas')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (err) throw err
    setTareas((prev) => prev.map((t) => (t.id === id ? data : t)))
    return data
  }

  const addTarea = async (tarea) => {
    const { data, error: err } = await supabase
      .from('tareas')
      .insert(tarea)
      .select()
      .single()
    if (err) throw err
    setTareas((prev) => [...prev, data])
    return data
  }

  const deleteTarea = async (id) => {
    const { error: err } = await supabase.from('tareas').delete().eq('id', id)
    if (err) throw err
    setTareas((prev) => prev.filter((t) => t.id !== id))
  }

  const importTareas = async (nuevasTareas) => {
    const { data, error: err } = await supabase
      .from('tareas')
      .upsert(nuevasTareas, { onConflict: 'id' })
      .select()
    if (err) throw err
    return data
  }

  return {
    tareas,
    bloques,
    loading,
    error,
    addBloque,
    archivarBloque,
    updateTarea,
    addTarea,
    deleteTarea,
    importTareas,
    refetch: fetchAll,
  }
}
