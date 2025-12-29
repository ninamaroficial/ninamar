"use client"

import { useState, useEffect } from 'react'
import { getDepartments, getCitiesByDepartment } from '@/lib/data/colombia-locations'
import styles from './LocationSelector.module.css'

interface LocationSelectorProps {
  selectedState: string
  selectedCity: string
  onStateChange: (state: string) => void
  onCityChange: (city: string) => void
  errors?: {
    state?: string
    city?: string
  }
}

export default function LocationSelector({
  selectedState,
  selectedCity,
  onStateChange,
  onCityChange,
  errors
}: LocationSelectorProps) {
  const [cities, setCities] = useState<{ id: number; name: string }[]>([])
  const departments = getDepartments()

  useEffect(() => {
    // Cuando cambia el departamento, obtener sus ciudades
    if (selectedState) {
      const citiesOfDept = getCitiesByDepartment(selectedState)
      setCities(citiesOfDept)
      
      // Si la ciudad seleccionada no está en el nuevo departamento, limpiarla
      const cityExists = citiesOfDept.some(c => c.name === selectedCity)
      if (!cityExists && selectedCity) {
        onCityChange('')
      }
    } else {
      setCities([])
      onCityChange('')
    }
  }, [selectedState])

  return (
    <div className={styles.locationSelector}>
      {/* Departamento */}
      <div className={styles.formGroup}>
        <label className={styles.label}>
          Departamento <span className={styles.required}>*</span>
        </label>
        <div className={styles.selectWrapper}>
          <select
            value={selectedState}
            onChange={(e) => onStateChange(e.target.value)}
            className={`${styles.select} ${errors?.state ? styles.error : ''}`}
          >
            <option value="">Selecciona un departamento</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.name}>
                {dept.name}
              </option>
            ))}
          </select>
          <div className={styles.selectIcon}>▼</div>
        </div>
        {errors?.state && (
          <p className={styles.errorText}>{errors.state}</p>
        )}
      </div>

      {/* Ciudad */}
      <div className={styles.formGroup}>
        <label className={styles.label}>
          Ciudad <span className={styles.required}>*</span>
        </label>
        <div className={styles.selectWrapper}>
          <select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            className={`${styles.select} ${errors?.city ? styles.error : ''}`}
            disabled={!selectedState || cities.length === 0}
          >
            <option value="">
              {!selectedState 
                ? 'Primero selecciona un departamento' 
                : 'Selecciona una ciudad'}
            </option>
            {cities.map((city) => (
              <option key={city.id} value={city.name}>
                {city.name}
              </option>
            ))}
          </select>
          <div className={styles.selectIcon}>▼</div>
        </div>
        {errors?.city && (
          <p className={styles.errorText}>{errors.city}</p>
        )}
      </div>
    </div>
  )
}