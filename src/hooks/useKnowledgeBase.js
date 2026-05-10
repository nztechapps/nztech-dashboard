import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useKnowledgeBase() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('knowledge_base')
        .select('*')
        .order('updated_at', { ascending: false })
      if (err) throw err
      setEntries(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createEntry = async (payload) => {
    const { data, error: err } = await supabase
      .from('knowledge_base')
      .insert([payload])
      .select()
    if (err) throw err
    await fetchAll()
    return data[0]
  }

  const updateEntry = async (id, payload) => {
    const { data, error: err } = await supabase
      .from('knowledge_base')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
    if (err) throw err
    await fetchAll()
    return data[0]
  }

  const deleteEntry = async (id) => {
    const { error: err } = await supabase
      .from('knowledge_base')
      .delete()
      .eq('id', id)
    if (err) throw err
    await fetchAll()
  }

  const getByCategoria = (categoria) =>
    categoria ? entries.filter((e) => e.categoria === categoria) : entries

  return { entries, loading, error, createEntry, updateEntry, deleteEntry, getByCategoria }
}
