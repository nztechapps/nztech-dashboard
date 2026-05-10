import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useGuiones() {
  const [guiones, setGuiones] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGuiones()
  }, [])

  const fetchGuiones = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('guiones')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setGuiones(data || [])
    } finally {
      setLoading(false)
    }
  }

  const createGuion = async (data) => {
    const { error } = await supabase.from('guiones').insert([data])
    if (error) throw error
    await fetchGuiones()
  }

  const updateGuion = async (id, data) => {
    const { error } = await supabase.from('guiones').update(data).eq('id', id)
    if (error) throw error
    await fetchGuiones()
  }

  const deleteGuion = async (id) => {
    const { error } = await supabase.from('guiones').delete().eq('id', id)
    if (error) throw error
    await fetchGuiones()
  }

  return { guiones, loading, createGuion, updateGuion, deleteGuion }
}
