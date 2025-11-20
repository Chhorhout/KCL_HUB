import { useState } from 'react';
import { HRMSSidebar } from '../components/HRMSSidebar';

// Khmer Holidays and Events for 2025-2029
// Note: Some dates (like Khmer New Year, Pchum Ben, Water Festival) vary slightly each year based on lunar calendar
const khmerHolidays: { [key: string]: Array<{ title: string; titleKhmer: string; type: 'holiday' | 'observance' | 'fullmoon' | 'event' }> } = {
  // ========== 2025 ==========
  // January (មករា)
  '2025-01-01': [{ title: 'International New Year', titleKhmer: 'ឆ្នាំថ្មីអន្តរជាតិ', type: 'holiday' }],
  '2025-01-07': [{ title: 'Victory over Genocide Day', titleKhmer: 'ថ្ងៃជ័យជំនះលើរបបប្រល័យពូជសាសន៍', type: 'holiday' }],
  
  // February (កុម្ភៈ)
  '2025-02-12': [{ title: 'Meak Bochea', titleKhmer: 'មាឃបូជា', type: 'fullmoon' }],
  
  // March (មីនា)
  '2025-03-08': [{ title: 'International Women\'s Day', titleKhmer: 'ថ្ងៃស្ត្រីអន្តរជាតិ', type: 'holiday' }],
  
  // April (មេសា)
  '2025-04-13': [{ title: 'Khmer New Year', titleKhmer: 'ចូលឆ្នាំខ្មែរ', type: 'holiday' }],
  '2025-04-14': [{ title: 'Khmer New Year', titleKhmer: 'ចូលឆ្នាំខ្មែរ', type: 'holiday' }],
  '2025-04-15': [{ title: 'Khmer New Year', titleKhmer: 'ចូលឆ្នាំខ្មែរ', type: 'holiday' }],
  '2025-04-12': [{ title: 'Visak Bochea', titleKhmer: 'វិសាខបូជា', type: 'fullmoon' }],
  
  // May (ឧសភា)
  '2025-05-01': [{ title: 'International Labor Day', titleKhmer: 'ថ្ងៃទានុងប្រជាជន', type: 'holiday' }],
  '2025-05-14': [{ title: 'Royal Plowing Ceremony', titleKhmer: 'ព្រះរាជពិធីបុណ្យច្រត់ព្រះនង្គ័ល', type: 'observance' }],
  
  // June (មិថុនា)
  '2025-06-01': [{ title: 'International Children\'s Day', titleKhmer: 'ថ្ងៃកុមារអន្តរជាតិ', type: 'holiday' }],
  '2025-06-18': [{ title: 'Birthday of HM Queen Mother', titleKhmer: 'ថ្ងៃខួបកំណើតព្រះមាតា', type: 'holiday' }],
  
  // September (កញ្ញា)
  '2025-09-24': [{ title: 'Constitution Day', titleKhmer: 'ថ្ងៃរដ្ឋធម្មនុញ្ញ', type: 'holiday' }],
  '2025-09-18': [{ title: 'Pchum Ben', titleKhmer: 'បុណ្យភ្ជុំបិណ្ឌ', type: 'holiday' }],
  '2025-09-19': [{ title: 'Pchum Ben', titleKhmer: 'បុណ្យភ្ជុំបិណ្ឌ', type: 'holiday' }],
  '2025-09-20': [{ title: 'Pchum Ben', titleKhmer: 'បុណ្យភ្ជុំបិណ្ឌ', type: 'holiday' }],
  
  // October (តុលា)
  '2025-10-15': [{ title: 'Commemoration Day of HM King Father', titleKhmer: 'ថ្ងៃរំលឹកព្រះបាទសម្តេច', type: 'holiday' }],
  '2025-10-23': [{ title: 'Paris Peace Agreement', titleKhmer: 'កិច្ចព្រមព្រៀងសន្តិភាពទីក្រុងប៉ារីស', type: 'holiday' }],
  '2025-10-29': [{ title: 'Coronation Day', titleKhmer: 'ថ្ងៃគ្រងរាជ្យ', type: 'holiday' }],
  '2025-10-31': [{ title: 'Birthday of HM King', titleKhmer: 'ថ្ងៃខួបកំណើតព្រះមហាក្សត្រ', type: 'holiday' }],
  
  // November (វិច្ឆិកា)
  '2025-11-03': [{ title: 'Water Festival', titleKhmer: 'ព្រះរាជពិធីបុណ្យអុំទូក', type: 'holiday' }],
  '2025-11-04': [{ title: 'Water Festival', titleKhmer: 'ព្រះរាជពិធីបុណ្យអុំទូក', type: 'holiday' }],
  '2025-11-05': [{ title: 'Water Festival', titleKhmer: 'ព្រះរាជពិធីបុណ្យអុំទូក', type: 'holiday' }],
  '2025-11-09': [{ title: 'Independence Day', titleKhmer: 'ថ្ងៃឯករាជ្យជាតិ', type: 'holiday' }],
  
  // December (ធ្នូ)
  '2025-12-10': [{ title: 'Human Rights Day', titleKhmer: 'ថ្ងៃសិទ្ធិមនុស្ស', type: 'holiday' }],

  // ========== 2026 ==========
  '2026-01-01': [{ title: 'International New Year', titleKhmer: 'ឆ្នាំថ្មីអន្តរជាតិ', type: 'holiday' }],
  '2026-01-07': [{ title: 'Victory over Genocide Day', titleKhmer: 'ថ្ងៃជ័យជំនះលើរបបប្រល័យពូជសាសន៍', type: 'holiday' }],
  '2026-02-01': [{ title: 'Meak Bochea', titleKhmer: 'មាឃបូជា', type: 'fullmoon' }],
  '2026-03-08': [{ title: 'International Women\'s Day', titleKhmer: 'ថ្ងៃស្ត្រីអន្តរជាតិ', type: 'holiday' }],
  '2026-04-13': [{ title: 'Khmer New Year', titleKhmer: 'ចូលឆ្នាំខ្មែរ', type: 'holiday' }],
  '2026-04-14': [{ title: 'Khmer New Year', titleKhmer: 'ចូលឆ្នាំខ្មែរ', type: 'holiday' }],
  '2026-04-15': [{ title: 'Khmer New Year', titleKhmer: 'ចូលឆ្នាំខ្មែរ', type: 'holiday' }],
  '2026-05-01': [{ title: 'International Labor Day', titleKhmer: 'ថ្ងៃទានុងប្រជាជន', type: 'holiday' }],
  '2026-05-03': [{ title: 'Royal Plowing Ceremony', titleKhmer: 'ព្រះរាជពិធីបុណ្យច្រត់ព្រះនង្គ័ល', type: 'observance' }],
  '2026-05-02': [{ title: 'Visak Bochea', titleKhmer: 'វិសាខបូជា', type: 'fullmoon' }],
  '2026-06-01': [{ title: 'International Children\'s Day', titleKhmer: 'ថ្ងៃកុមារអន្តរជាតិ', type: 'holiday' }],
  '2026-06-18': [{ title: 'Birthday of HM Queen Mother', titleKhmer: 'ថ្ងៃខួបកំណើតព្រះមាតា', type: 'holiday' }],
  '2026-09-24': [{ title: 'Constitution Day', titleKhmer: 'ថ្ងៃរដ្ឋធម្មនុញ្ញ', type: 'holiday' }],
  '2026-10-07': [{ title: 'Pchum Ben', titleKhmer: 'បុណ្យភ្ជុំបិណ្ឌ', type: 'holiday' }],
  '2026-10-08': [{ title: 'Pchum Ben', titleKhmer: 'បុណ្យភ្ជុំបិណ្ឌ', type: 'holiday' }],
  '2026-10-09': [{ title: 'Pchum Ben', titleKhmer: 'បុណ្យភ្ជុំបិណ្ឌ', type: 'holiday' }],
  '2026-10-15': [{ title: 'Commemoration Day of HM King Father', titleKhmer: 'ថ្ងៃរំលឹកព្រះបាទសម្តេច', type: 'holiday' }],
  '2026-10-23': [{ title: 'Paris Peace Agreement', titleKhmer: 'កិច្ចព្រមព្រៀងសន្តិភាពទីក្រុងប៉ារីស', type: 'holiday' }],
  '2026-10-29': [{ title: 'Coronation Day', titleKhmer: 'ថ្ងៃគ្រងរាជ្យ', type: 'holiday' }],
  '2026-10-31': [{ title: 'Birthday of HM King', titleKhmer: 'ថ្ងៃខួបកំណើតព្រះមហាក្សត្រ', type: 'holiday' }],
  '2026-11-22': [{ title: 'Water Festival', titleKhmer: 'ព្រះរាជពិធីបុណ្យអុំទូក', type: 'holiday' }],
  '2026-11-23': [{ title: 'Water Festival', titleKhmer: 'ព្រះរាជពិធីបុណ្យអុំទូក', type: 'holiday' }],
  '2026-11-24': [{ title: 'Water Festival', titleKhmer: 'ព្រះរាជពិធីបុណ្យអុំទូក', type: 'holiday' }],
  '2026-11-09': [{ title: 'Independence Day', titleKhmer: 'ថ្ងៃឯករាជ្យជាតិ', type: 'holiday' }],
  '2026-12-10': [{ title: 'Human Rights Day', titleKhmer: 'ថ្ងៃសិទ្ធិមនុស្ស', type: 'holiday' }],

  // ========== 2027 ==========
  '2027-01-01': [{ title: 'International New Year', titleKhmer: 'ឆ្នាំថ្មីអន្តរជាតិ', type: 'holiday' }],
  '2027-01-07': [{ title: 'Victory over Genocide Day', titleKhmer: 'ថ្ងៃជ័យជំនះលើរបបប្រល័យពូជសាសន៍', type: 'holiday' }],
  '2027-01-22': [{ title: 'Meak Bochea', titleKhmer: 'មាឃបូជា', type: 'fullmoon' }],
  '2027-03-08': [{ title: 'International Women\'s Day', titleKhmer: 'ថ្ងៃស្ត្រីអន្តរជាតិ', type: 'holiday' }],
  '2027-04-13': [{ title: 'Khmer New Year', titleKhmer: 'ចូលឆ្នាំខ្មែរ', type: 'holiday' }],
  '2027-04-14': [{ title: 'Khmer New Year', titleKhmer: 'ចូលឆ្នាំខ្មែរ', type: 'holiday' }],
  '2027-04-15': [{ title: 'Khmer New Year', titleKhmer: 'ចូលឆ្នាំខ្មែរ', type: 'holiday' }],
  '2027-05-01': [{ title: 'International Labor Day', titleKhmer: 'ថ្ងៃទានុងប្រជាជន', type: 'holiday' }],
  '2027-05-22': [
    { title: 'Royal Plowing Ceremony', titleKhmer: 'ព្រះរាជពិធីបុណ្យច្រត់ព្រះនង្គ័ល', type: 'observance' },
    { title: 'Visak Bochea', titleKhmer: 'វិសាខបូជា', type: 'fullmoon' }
  ],
  '2027-06-01': [{ title: 'International Children\'s Day', titleKhmer: 'ថ្ងៃកុមារអន្តរជាតិ', type: 'holiday' }],
  '2027-06-18': [{ title: 'Birthday of HM Queen Mother', titleKhmer: 'ថ្ងៃខួបកំណើតព្រះមាតា', type: 'holiday' }],
  '2027-09-24': [{ title: 'Constitution Day', titleKhmer: 'ថ្ងៃរដ្ឋធម្មនុញ្ញ', type: 'holiday' }],
  '2027-09-26': [{ title: 'Pchum Ben', titleKhmer: 'បុណ្យភ្ជុំបិណ្ឌ', type: 'holiday' }],
  '2027-09-27': [{ title: 'Pchum Ben', titleKhmer: 'បុណ្យភ្ជុំបិណ្ឌ', type: 'holiday' }],
  '2027-09-28': [{ title: 'Pchum Ben', titleKhmer: 'បុណ្យភ្ជុំបិណ្ឌ', type: 'holiday' }],
  '2027-10-15': [{ title: 'Commemoration Day of HM King Father', titleKhmer: 'ថ្ងៃរំលឹកព្រះបាទសម្តេច', type: 'holiday' }],
  '2027-10-23': [{ title: 'Paris Peace Agreement', titleKhmer: 'កិច្ចព្រមព្រៀងសន្តិភាពទីក្រុងប៉ារីស', type: 'holiday' }],
  '2027-10-29': [{ title: 'Coronation Day', titleKhmer: 'ថ្ងៃគ្រងរាជ្យ', type: 'holiday' }],
  '2027-10-31': [{ title: 'Birthday of HM King', titleKhmer: 'ថ្ងៃខួបកំណើតព្រះមហាក្សត្រ', type: 'holiday' }],
  '2027-11-11': [{ title: 'Water Festival', titleKhmer: 'ព្រះរាជពិធីបុណ្យអុំទូក', type: 'holiday' }],
  '2027-11-12': [{ title: 'Water Festival', titleKhmer: 'ព្រះរាជពិធីបុណ្យអុំទូក', type: 'holiday' }],
  '2027-11-13': [{ title: 'Water Festival', titleKhmer: 'ព្រះរាជពិធីបុណ្យអុំទូក', type: 'holiday' }],
  '2027-11-09': [{ title: 'Independence Day', titleKhmer: 'ថ្ងៃឯករាជ្យជាតិ', type: 'holiday' }],
  '2027-12-10': [{ title: 'Human Rights Day', titleKhmer: 'ថ្ងៃសិទ្ធិមនុស្ស', type: 'holiday' }],

  // ========== 2028 ==========
  '2028-01-01': [{ title: 'International New Year', titleKhmer: 'ឆ្នាំថ្មីអន្តរជាតិ', type: 'holiday' }],
  '2028-01-07': [{ title: 'Victory over Genocide Day', titleKhmer: 'ថ្ងៃជ័យជំនះលើរបបប្រល័យពូជសាសន៍', type: 'holiday' }],
  '2028-02-10': [{ title: 'Meak Bochea', titleKhmer: 'មាឃបូជា', type: 'fullmoon' }],
  '2028-03-08': [{ title: 'International Women\'s Day', titleKhmer: 'ថ្ងៃស្ត្រីអន្តរជាតិ', type: 'holiday' }],
  '2028-04-13': [{ title: 'Khmer New Year', titleKhmer: 'ចូលឆ្នាំខ្មែរ', type: 'holiday' }],
  '2028-04-14': [{ title: 'Khmer New Year', titleKhmer: 'ចូលឆ្នាំខ្មែរ', type: 'holiday' }],
  '2028-04-15': [{ title: 'Khmer New Year', titleKhmer: 'ចូលឆ្នាំខ្មែរ', type: 'holiday' }],
  '2028-05-01': [{ title: 'International Labor Day', titleKhmer: 'ថ្ងៃទានុងប្រជាជន', type: 'holiday' }],
  '2028-05-10': [
    { title: 'Royal Plowing Ceremony', titleKhmer: 'ព្រះរាជពិធីបុណ្យច្រត់ព្រះនង្គ័ល', type: 'observance' },
    { title: 'Visak Bochea', titleKhmer: 'វិសាខបូជា', type: 'fullmoon' }
  ],
  '2028-06-01': [{ title: 'International Children\'s Day', titleKhmer: 'ថ្ងៃកុមារអន្តរជាតិ', type: 'holiday' }],
  '2028-06-18': [{ title: 'Birthday of HM Queen Mother', titleKhmer: 'ថ្ងៃខួបកំណើតព្រះមាតា', type: 'holiday' }],
  '2028-09-24': [{ title: 'Constitution Day', titleKhmer: 'ថ្ងៃរដ្ឋធម្មនុញ្ញ', type: 'holiday' }],
  '2028-09-15': [{ title: 'Pchum Ben', titleKhmer: 'បុណ្យភ្ជុំបិណ្ឌ', type: 'holiday' }],
  '2028-09-16': [{ title: 'Pchum Ben', titleKhmer: 'បុណ្យភ្ជុំបិណ្ឌ', type: 'holiday' }],
  '2028-09-17': [{ title: 'Pchum Ben', titleKhmer: 'បុណ្យភ្ជុំបិណ្ឌ', type: 'holiday' }],
  '2028-10-15': [{ title: 'Commemoration Day of HM King Father', titleKhmer: 'ថ្ងៃរំលឹកព្រះបាទសម្តេច', type: 'holiday' }],
  '2028-10-23': [{ title: 'Paris Peace Agreement', titleKhmer: 'កិច្ចព្រមព្រៀងសន្តិភាពទីក្រុងប៉ារីស', type: 'holiday' }],
  '2028-10-29': [{ title: 'Coronation Day', titleKhmer: 'ថ្ងៃគ្រងរាជ្យ', type: 'holiday' }],
  '2028-10-30': [{ title: 'Water Festival', titleKhmer: 'ព្រះរាជពិធីបុណ្យអុំទូក', type: 'holiday' }],
  '2028-10-31': [
    { title: 'Birthday of HM King', titleKhmer: 'ថ្ងៃខួបកំណើតព្រះមហាក្សត្រ', type: 'holiday' },
    { title: 'Water Festival', titleKhmer: 'ព្រះរាជពិធីបុណ្យអុំទូក', type: 'holiday' }
  ],
  '2028-11-01': [{ title: 'Water Festival', titleKhmer: 'ព្រះរាជពិធីបុណ្យអុំទូក', type: 'holiday' }],
  '2028-11-09': [{ title: 'Independence Day', titleKhmer: 'ថ្ងៃឯករាជ្យជាតិ', type: 'holiday' }],
  '2028-12-10': [{ title: 'Human Rights Day', titleKhmer: 'ថ្ងៃសិទ្ធិមនុស្ស', type: 'holiday' }],

  // ========== 2029 ==========
  '2029-01-01': [{ title: 'International New Year', titleKhmer: 'ឆ្នាំថ្មីអន្តរជាតិ', type: 'holiday' }],
  '2029-01-07': [{ title: 'Victory over Genocide Day', titleKhmer: 'ថ្ងៃជ័យជំនះលើរបបប្រល័យពូជសាសន៍', type: 'holiday' }],
  '2029-01-29': [{ title: 'Meak Bochea', titleKhmer: 'មាឃបូជា', type: 'fullmoon' }],
  '2029-03-08': [{ title: 'International Women\'s Day', titleKhmer: 'ថ្ងៃស្ត្រីអន្តរជាតិ', type: 'holiday' }],
  '2029-04-13': [{ title: 'Khmer New Year', titleKhmer: 'ចូលឆ្នាំខ្មែរ', type: 'holiday' }],
  '2029-04-14': [{ title: 'Khmer New Year', titleKhmer: 'ចូលឆ្នាំខ្មែរ', type: 'holiday' }],
  '2029-04-15': [{ title: 'Khmer New Year', titleKhmer: 'ចូលឆ្នាំខ្មែរ', type: 'holiday' }],
  '2029-04-29': [{ title: 'Visak Bochea', titleKhmer: 'វិសាខបូជា', type: 'fullmoon' }],
  '2029-05-01': [{ title: 'International Labor Day', titleKhmer: 'ថ្ងៃទានុងប្រជាជន', type: 'holiday' }],
  '2029-05-29': [{ title: 'Royal Plowing Ceremony', titleKhmer: 'ព្រះរាជពិធីបុណ្យច្រត់ព្រះនង្គ័ល', type: 'observance' }],
  '2029-06-01': [{ title: 'International Children\'s Day', titleKhmer: 'ថ្ងៃកុមារអន្តរជាតិ', type: 'holiday' }],
  '2029-06-18': [{ title: 'Birthday of HM Queen Mother', titleKhmer: 'ថ្ងៃខួបកំណើតព្រះមាតា', type: 'holiday' }],
  '2029-09-24': [{ title: 'Constitution Day', titleKhmer: 'ថ្ងៃរដ្ឋធម្មនុញ្ញ', type: 'holiday' }],
  '2029-10-04': [{ title: 'Pchum Ben', titleKhmer: 'បុណ្យភ្ជុំបិណ្ឌ', type: 'holiday' }],
  '2029-10-05': [{ title: 'Pchum Ben', titleKhmer: 'បុណ្យភ្ជុំបិណ្ឌ', type: 'holiday' }],
  '2029-10-06': [{ title: 'Pchum Ben', titleKhmer: 'បុណ្យភ្ជុំបិណ្ឌ', type: 'holiday' }],
  '2029-10-15': [{ title: 'Commemoration Day of HM King Father', titleKhmer: 'ថ្ងៃរំលឹកព្រះបាទសម្តេច', type: 'holiday' }],
  '2029-10-19': [{ title: 'Water Festival', titleKhmer: 'ព្រះរាជពិធីបុណ្យអុំទូក', type: 'holiday' }],
  '2029-10-20': [{ title: 'Water Festival', titleKhmer: 'ព្រះរាជពិធីបុណ្យអុំទូក', type: 'holiday' }],
  '2029-10-21': [{ title: 'Water Festival', titleKhmer: 'ព្រះរាជពិធីបុណ្យអុំទូក', type: 'holiday' }],
  '2029-10-23': [{ title: 'Paris Peace Agreement', titleKhmer: 'កិច្ចព្រមព្រៀងសន្តិភាពទីក្រុងប៉ារីស', type: 'holiday' }],
  '2029-10-29': [{ title: 'Coronation Day', titleKhmer: 'ថ្ងៃគ្រងរាជ្យ', type: 'holiday' }],
  '2029-10-31': [{ title: 'Birthday of HM King', titleKhmer: 'ថ្ងៃខួបកំណើតព្រះមហាក្សត្រ', type: 'holiday' }],
  '2029-11-09': [{ title: 'Independence Day', titleKhmer: 'ថ្ងៃឯករាជ្យជាតិ', type: 'holiday' }],
  '2029-12-10': [{ title: 'Human Rights Day', titleKhmer: 'ថ្ងៃសិទ្ធិមនុស្ស', type: 'holiday' }],
}

// Helper function to get events for any date
const getKhmerEvents = (year: number, month: number, day: number) => {
  const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return khmerHolidays[dateKey] || []
}

export function HRMSDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showRedFilter, setShowRedFilter] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [hoveredDate, setHoveredDate] = useState<number | null>(null)

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  // Khmer month names
  const monthNames = [
    'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
    'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ'
  ]

  // Khmer day names
  const dayNames = ['អាទិត្យ', 'ច័ន្ទ', 'អង្គារ', 'ពុធ', 'ព្រហស្បតិ៍', 'សុក្រ', 'សៅរ៍']

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getEventsForDate = (day: number) => {
    return getKhmerEvents(year, month, day)
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case 'holiday': return 'bg-red-500'
      case 'observance': return 'bg-green-500'
      case 'fullmoon': return 'bg-yellow-500'
      case 'event': return 'bg-purple-500'
      default: return 'bg-slate-500'
    }
  }

  const isSunday = (day: number) => {
    const dayDate = new Date(year, month, day)
    return dayDate.getDay() === 0
  }

  const renderCalendarDays = () => {
    const days = []
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-24 border border-slate-200 bg-slate-50"></div>
      )
    }

    // Days of the month
    const today = new Date()
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = 
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear()

      // Example: Show red filter on weekends (Saturday = 6, Sunday = 0)
      const dayDate = new Date(year, month, day)
      const dayOfWeek = dayDate.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const shouldShowRed = showRedFilter && isWeekend

      const events = getEventsForDate(day)
      const hasEvents = events.length > 0
      const isSelected = selectedDate && 
        day === selectedDate.getDate() &&
        month === selectedDate.getMonth() &&
        year === selectedDate.getFullYear()
      const isHovered = hoveredDate === day
      const isSundayDay = isSunday(day)
      const hasHoliday = events.some(e => e.type === 'holiday')
      const hasFullMoon = events.some(e => e.type === 'fullmoon')

      days.push(
        <div
          key={day}
          onClick={() => setSelectedDate(new Date(year, month, day))}
          onMouseEnter={() => setHoveredDate(day)}
          onMouseLeave={() => setHoveredDate(null)}
          className={`h-28 border-2 p-2 transition-all duration-200 cursor-pointer flex flex-col relative group ${
            isSelected
              ? 'bg-blue-500 border-blue-600 shadow-lg scale-105 z-10'
              : hasHoliday
                ? 'bg-green-100 border-green-400 hover:bg-green-200'
                : isSundayDay && !shouldShowRed
                  ? 'bg-green-50 border-green-300'
                  : shouldShowRed 
                    ? 'bg-red-50 border-red-300 hover:bg-red-100 hover:border-red-400' 
                    : isToday 
                      ? 'bg-gradient-to-br from-blue-100 to-blue-50 border-blue-400 hover:border-blue-500 shadow-md' 
                      : 'bg-white border-slate-200 hover:bg-gradient-to-br hover:from-slate-50 hover:to-blue-50 hover:border-blue-300 hover:shadow-md'
          } ${isHovered && !isSelected ? 'transform scale-102' : ''}`}
        >
          {/* Day number */}
          <div className={`text-sm font-bold mb-1 flex items-center justify-between ${
            isSelected
              ? 'text-white'
              : hasHoliday
                ? 'text-green-700'
                : shouldShowRed 
                  ? 'text-red-700' 
                  : isToday 
                    ? 'text-blue-700' 
                    : 'text-slate-700'
          }`}>
            <span className={isToday && !isSelected ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs' : ''}>
              {day}
            </span>
            {isToday && !isSelected && (
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
            )}
            {hasFullMoon && !isSelected && (
              <span className="text-yellow-600 text-xs">🌕</span>
            )}
          </div>
          
          {/* Khmer holiday/event labels */}
          {hasEvents && (
            <div className="mt-auto space-y-0.5">
              {events.slice(0, 2).map((event, index) => (
                <div
                  key={index}
                  className={`text-[9px] font-semibold px-1 py-0.5 rounded khmer-text ${
                    event.type === 'holiday'
                      ? 'bg-green-200 text-green-800'
                      : event.type === 'observance'
                        ? 'bg-blue-100 text-blue-800'
                        : event.type === 'fullmoon'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-purple-100 text-purple-800'
                  } ${isSelected ? 'bg-white/20 text-white' : ''}`}
                  title={event.titleKhmer || event.title}
                >
                  {event.type === 'observance' ? 'ថ្ងៃកោរ' : event.titleKhmer || event.title}
                </div>
              ))}
              {events.length > 2 && (
                <div className="text-[9px] text-slate-500 font-medium khmer-text">
                  +{events.length - 2} ផ្សេងៗ
                </div>
              )}
            </div>
          )}
          
          {/* Event indicator dots */}
          {hasEvents && (
            <div className="flex flex-wrap gap-1 mt-1">
              {events.slice(0, 3).map((event, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${getEventColor(event.type)} ${
                    isSelected ? 'ring-2 ring-white' : ''
                  } transition-all group-hover:scale-125`}
                  title={event.titleKhmer || event.title}
                />
              ))}
            </div>
          )}
          
          {/* Hover tooltip */}
          {isHovered && hasEvents && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl z-20 min-w-[200px]">
              <div className="space-y-1.5">
                {events.map((event, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${getEventColor(event.type)}`}></div>
                    <div className="flex-1">
                      <div className="font-semibold khmer-text">{event.titleKhmer || event.title}</div>
                      {event.titleKhmer && event.title !== event.titleKhmer && (
                        <div className="text-[10px] text-slate-300">{event.title}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                <div className="border-4 border-transparent border-t-slate-900"></div>
              </div>
            </div>
          )}
        </div>
      )
    }

    return days
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar on the left */}
      <HRMSSidebar />

      {/* Main content area */}
      <main className="flex-1 ml-72 px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">HRMS Calendar</h1>
          <p className="text-slate-600">Human Resource Management System</p>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
          {/* Calendar Header */}
          <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-blue-50 border-b border-slate-200 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={goToPreviousMonth}
                className="p-2.5 hover:bg-white rounded-xl transition-all duration-200 hover:shadow-md hover:scale-110 active:scale-95"
              >
                <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <span className="text-blue-600 khmer-text">{monthNames[month]}</span>
                <span className="text-slate-500">{year}</span>
              </h2>
              <button
                onClick={goToNextMonth}
                className="p-2.5 hover:bg-white rounded-xl transition-all duration-200 hover:shadow-md hover:scale-110 active:scale-95"
              >
                <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowRedFilter(!showRedFilter)}
                className={`px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold flex items-center gap-2 shadow-sm hover:shadow-md ${
                  showRedFilter
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transform hover:scale-105'
                    : 'bg-white border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filter
              </button>
              <button
                onClick={goToToday}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
              >
                Today
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6 bg-gradient-to-b from-white to-slate-50">
            {/* Day Names Header */}
            <div className="grid grid-cols-7 gap-0 mb-4">
              {dayNames.map((day, index) => (
                <div
                  key={day}
                  className={`text-center text-sm font-bold py-3 khmer-text ${
                    index === 0 || index === 6
                      ? 'text-red-600 bg-red-50 rounded-lg mx-1'
                      : 'text-slate-700'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-2">
              {renderCalendarDays()}
            </div>
          </div>
          
          {/* Selected Date Events Panel */}
          {selectedDate && (
            <div className="border-t border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Events on {selectedDate.getDate()} <span className="khmer-text">{monthNames[selectedDate.getMonth()]}</span> {selectedDate.getFullYear()}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-slate-500 hover:text-slate-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {getEventsForDate(selectedDate.getDate()).length > 0 ? (
                <div className="space-y-2">
                  {getEventsForDate(selectedDate.getDate()).map((event, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-all"
                    >
                      <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${getEventColor(event.type)}`}></div>
                      <div className="flex-1">
                        <div className="text-slate-900 font-semibold mb-1 khmer-text">{event.titleKhmer || event.title}</div>
                        {event.titleKhmer && event.title !== event.titleKhmer && (
                          <div className="text-sm text-slate-600">{event.title}</div>
                        )}
                        <div className="text-xs text-slate-500 mt-1 khmer-text">
                          {event.type === 'holiday' ? 'ថ្ងៃបុណ្យ' : 
                           event.type === 'observance' ? 'ថ្ងៃកោរ' :
                           event.type === 'fullmoon' ? 'ពេញបូណ៌មី' : 'ព្រឹត្តិការណ៍'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-4 khmer-text">មិនមានព្រឹត្តិការណ៍សម្រាប់ថ្ងៃនេះ</p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

