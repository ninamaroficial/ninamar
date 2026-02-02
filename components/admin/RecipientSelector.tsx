"use client"

import { useState } from 'react'
import { X, CheckCircle, Circle } from 'lucide-react'
import styles from './RecipientSelector.module.css'

interface Subscriber {
  id: string
  email: string
  name: string | null
  is_active: boolean
  created_at: string
}

interface RecipientSelectorProps {
  subscribers: Subscriber[]
  onSelect: (recipientType: 'all' | 'active' | 'selected', selectedIds?: string[]) => void
  selectedType?: 'all' | 'active' | 'selected'
  selectedIds?: string[]
}

export default function RecipientSelector({ 
  subscribers, 
  onSelect, 
  selectedType = 'active',
  selectedIds = []
}: RecipientSelectorProps) {
  const [localSelectedType, setLocalSelectedType] = useState(selectedType)
  const [localSelectedIds, setLocalSelectedIds] = useState<string[]>(selectedIds)
  const [searchTerm, setSearchTerm] = useState('')

  const handleTypeChange = (type: 'all' | 'active' | 'selected') => {
    setLocalSelectedType(type)
    if (type !== 'selected') {
      onSelect(type)
    } else {
      onSelect(type, localSelectedIds)
    }
  }

  const toggleSubscriber = (subscriberId: string) => {
    const newSelectedIds = localSelectedIds.includes(subscriberId)
      ? localSelectedIds.filter(id => id !== subscriberId)
      : [...localSelectedIds, subscriberId]
    
    setLocalSelectedIds(newSelectedIds)
    onSelect('selected', newSelectedIds)
  }

  const selectAll = () => {
    const allIds = filteredSubscribers.map(s => s.id)
    setLocalSelectedIds(allIds)
    onSelect('selected', allIds)
  }

  const deselectAll = () => {
    setLocalSelectedIds([])
    onSelect('selected', [])
  }

  const filteredSubscribers = subscribers.filter(subscriber => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      subscriber.email.toLowerCase().includes(search) ||
      subscriber.name?.toLowerCase().includes(search)
    )
  })

  const activeCount = subscribers.filter(s => s.is_active).length
  const selectedCount = localSelectedType === 'selected' ? localSelectedIds.length : 0

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Destinatarios</h3>
        <p className={styles.subtitle}>Selecciona quién recibirá el newsletter</p>
      </div>

      {/* Tipo de destinatarios */}
      <div className={styles.typeSelector}>
        <label className={`${styles.typeOption} ${localSelectedType === 'active' ? styles.active : ''}`}>
          <input
            type="radio"
            name="recipientType"
            value="active"
            checked={localSelectedType === 'active'}
            onChange={() => handleTypeChange('active')}
          />
          <div className={styles.optionContent}>
            <CheckCircle size={20} />
            <div>
              <div className={styles.optionTitle}>Suscriptores Activos</div>
              <div className={styles.optionDesc}>{activeCount} suscriptores</div>
            </div>
          </div>
        </label>



        <label className={`${styles.typeOption} ${localSelectedType === 'selected' ? styles.active : ''}`}>
          <input
            type="radio"
            name="recipientType"
            value="selected"
            checked={localSelectedType === 'selected'}
            onChange={() => handleTypeChange('selected')}
          />
          <div className={styles.optionContent}>
            <CheckCircle size={20} />
            <div>
              <div className={styles.optionTitle}>Selección Manual</div>
              <div className={styles.optionDesc}>
                {selectedCount > 0 ? `${selectedCount} seleccionados` : 'Elige destinatarios específicos'}
              </div>
            </div>
          </div>
        </label>
      </div>

      {/* Lista de suscriptores (solo visible en modo "selected") */}
      {localSelectedType === 'selected' && (
        <div className={styles.subscribersList}>
          <div className={styles.searchBar}>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por email o nombre..."
              className={styles.searchInput}
            />
            <div className={styles.bulkActions}>
              <button onClick={selectAll} className={styles.bulkButton}>
                Seleccionar Todos
              </button>
              <button onClick={deselectAll} className={styles.bulkButton}>
                Deseleccionar Todos
              </button>
            </div>
          </div>

          <div className={styles.list}>
            {filteredSubscribers.length > 0 ? (
              filteredSubscribers.map(subscriber => (
                <label
                  key={subscriber.id}
                  className={`${styles.subscriberItem} ${localSelectedIds.includes(subscriber.id) ? styles.selected : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={localSelectedIds.includes(subscriber.id)}
                    onChange={() => toggleSubscriber(subscriber.id)}
                    className={styles.checkbox}
                  />
                  <div className={styles.subscriberInfo}>
                    <div className={styles.subscriberEmail}>{subscriber.email}</div>
                    {subscriber.name && (
                      <div className={styles.subscriberName}>{subscriber.name}</div>
                    )}
                  </div>
                  <div className={`${styles.status} ${subscriber.is_active ? styles.statusActive : styles.statusInactive}`}>
                    {subscriber.is_active ? 'Activo' : 'Inactivo'}
                  </div>
                </label>
              ))
            ) : (
              <div className={styles.empty}>
                No se encontraron suscriptores
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resumen */}
      <div className={styles.summary}>
        <strong>Enviar a:</strong>{' '}
        {localSelectedType === 'all' && `${subscribers.length} suscriptores (todos)`}
        {localSelectedType === 'active' && `${activeCount} suscriptores activos`}
        {localSelectedType === 'selected' && `${selectedCount} suscriptores seleccionados`}
      </div>
    </div>
  )
}
