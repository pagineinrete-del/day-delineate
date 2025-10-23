import React, { useState, useEffect } from 'react';
import { Calendar, Users, Plus, Trash2, Download, Filter, Edit2, X, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Person {
  id: number;
  name: string;
  color: string;
}

interface Shift {
  id: number;
  date: string;
  peopleIds: number[];
}

interface Constraint {
  id: number;
  person1: number;
  person2: number;
}

const ShiftManager = () => {
  const [people, setPeople] = useState<Person[]>([
    { id: 1, name: 'Gennaro', color: '#3b82f6' },
    { id: 2, name: 'Luana', color: '#ef4444' },
    { id: 3, name: 'Paolo', color: '#10b981' },
    { id: 4, name: 'Emanuele', color: '#f59e0b' },
    { id: 5, name: 'Ruffina', color: '#8b5cf6' }
  ]);

  const [shifts, setShifts] = useState<Shift[]>([
    { id: 1, date: '2025-11-01', peopleIds: [1, 2] },
    { id: 2, date: '2025-11-08', peopleIds: [3, 4] },
    { id: 3, date: '2025-11-15', peopleIds: [5, 1] },
    { id: 4, date: '2025-11-22', peopleIds: [2, 4] },
    { id: 5, date: '2025-11-29', peopleIds: [3, 1] },
    { id: 6, date: '2025-12-06', peopleIds: [5, 4] },
    { id: 7, date: '2025-12-13', peopleIds: [3, 2] },
    { id: 8, date: '2025-12-20', peopleIds: [5, 1] },
    { id: 9, date: '2025-12-27', peopleIds: [2, 4] },
    { id: 10, date: '2026-01-03', peopleIds: [3, 5] }
  ]);

  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const [activeTab, setActiveTab] = useState('shifts');
  const [filterPerson, setFilterPerson] = useState<number | null>(null);
  const [filterDate, setFilterDate] = useState('');
  const [editingPerson, setEditingPerson] = useState<number | null>(null);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonColor, setNewPersonColor] = useState('#6366f1');
  const [newShiftDate, setNewShiftDate] = useState('');
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [showAddShift, setShowAddShift] = useState(false);
  const [showConstraints, setShowConstraints] = useState(false);
  const [selectedPerson1, setSelectedPerson1] = useState('');
  const [selectedPerson2, setSelectedPerson2] = useState('');

  // Salvataggio automatico su localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shift-people', JSON.stringify(people));
      localStorage.setItem('shift-shifts', JSON.stringify(shifts));
      localStorage.setItem('shift-constraints', JSON.stringify(constraints));
    } catch (error) {
      console.error('Errore salvataggio:', error);
    }
  }, [people, shifts, constraints]);

  // Caricamento dati all'avvio
  useEffect(() => {
    try {
      const peopleData = localStorage.getItem('shift-people');
      const shiftsData = localStorage.getItem('shift-shifts');
      const constraintsData = localStorage.getItem('shift-constraints');
      
      if (peopleData) setPeople(JSON.parse(peopleData));
      if (shiftsData) setShifts(JSON.parse(shiftsData));
      if (constraintsData) setConstraints(JSON.parse(constraintsData));
    } catch (error) {
      console.log('Primi dati caricati');
    }
  }, []);

  const addPerson = () => {
    if (!newPersonName.trim()) {
      toast.error('Inserisci un nome valido');
      return;
    }
    const newPerson: Person = {
      id: Date.now(),
      name: newPersonName,
      color: newPersonColor
    };
    setPeople([...people, newPerson]);
    setNewPersonName('');
    setNewPersonColor('#6366f1');
    setShowAddPerson(false);
    toast.success(`${newPersonName} aggiunto con successo`);
  };

  const deletePerson = (id: number) => {
    const person = people.find(p => p.id === id);
    setPeople(people.filter(p => p.id !== id));
    setShifts(shifts.map(shift => ({
      ...shift,
      peopleIds: shift.peopleIds.filter(pId => pId !== id)
    })));
    setConstraints(constraints.filter(c => c.person1 !== id && c.person2 !== id));
    toast.success(`${person?.name} eliminato`);
  };

  const updatePersonColor = (id: number, color: string) => {
    setPeople(people.map(p => p.id === id ? { ...p, color } : p));
  };

  const updatePersonName = (id: number, name: string) => {
    if (!name.trim()) return;
    setPeople(people.map(p => p.id === id ? { ...p, name } : p));
    setEditingPerson(null);
    toast.success('Nome aggiornato');
  };

  const addShift = () => {
    if (!newShiftDate) {
      toast.error('Seleziona una data');
      return;
    }
    const newShift: Shift = {
      id: Date.now(),
      date: newShiftDate,
      peopleIds: []
    };
    setShifts([...shifts, newShift].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setNewShiftDate('');
    setShowAddShift(false);
    toast.success('Turno aggiunto');
  };

  const deleteShift = (id: number) => {
    setShifts(shifts.filter(s => s.id !== id));
    toast.success('Turno eliminato');
  };

  const togglePersonInShift = (shiftId: number, personId: number) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (!shift) return;

    const newPeopleIds = shift.peopleIds.includes(personId)
      ? shift.peopleIds.filter(id => id !== personId)
      : [...shift.peopleIds, personId];

    // Verifica vincoli
    const violatesConstraint = constraints.some(constraint => {
      const hasPerson1 = newPeopleIds.includes(constraint.person1);
      const hasPerson2 = newPeopleIds.includes(constraint.person2);
      return hasPerson1 && hasPerson2;
    });

    if (violatesConstraint) {
      toast.error('Questa assegnazione viola un vincolo esistente!');
      return;
    }

    setShifts(shifts.map(s => s.id === shiftId ? { ...s, peopleIds: newPeopleIds } : s));
  };

  const addConstraint = () => {
    if (!selectedPerson1 || !selectedPerson2 || selectedPerson1 === selectedPerson2) {
      toast.error('Seleziona due persone diverse');
      return;
    }
    
    const exists = constraints.some(c => 
      (c.person1 === parseInt(selectedPerson1) && c.person2 === parseInt(selectedPerson2)) ||
      (c.person1 === parseInt(selectedPerson2) && c.person2 === parseInt(selectedPerson1))
    );

    if (!exists) {
      setConstraints([...constraints, {
        id: Date.now(),
        person1: parseInt(selectedPerson1),
        person2: parseInt(selectedPerson2)
      }]);
      toast.success('Vincolo aggiunto');
    } else {
      toast.error('Vincolo già esistente');
    }
    setSelectedPerson1('');
    setSelectedPerson2('');
  };

  const deleteConstraint = (id: number) => {
    setConstraints(constraints.filter(c => c.id !== id));
    toast.success('Vincolo eliminato');
  };

  const exportToPDF = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Turni di Riposo - ${new Date().toLocaleDateString('it-IT')}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
          }
          h1 {
            color: #2563eb;
            margin-bottom: 5px;
          }
          .export-date {
            color: #666;
            font-size: 14px;
            margin-bottom: 20px;
          }
          .legend {
            margin: 20px 0;
            padding: 15px;
            background: #f3f4f6;
            border-radius: 8px;
          }
          .legend h2 {
            margin-top: 0;
            font-size: 16px;
            color: #333;
          }
          .legend-item {
            display: inline-block;
            margin: 5px 15px 5px 0;
            padding: 5px 12px;
            border-radius: 15px;
            color: white;
            font-weight: bold;
            font-size: 14px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
          }
          th {
            background-color: #2563eb;
            color: white;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .person-badge {
            display: inline-block;
            margin: 3px;
            padding: 4px 10px;
            border-radius: 12px;
            color: white;
            font-size: 13px;
            font-weight: 500;
          }
          .constraints {
            margin-top: 30px;
            padding: 15px;
            background: #fef3c7;
            border-left: 4px solid #eab308;
            border-radius: 4px;
          }
          .constraints h2 {
            color: #92400e;
            margin-top: 0;
            font-size: 16px;
          }
          .constraint-item {
            margin: 8px 0;
            color: #333;
          }
          @media print {
            body {
              padding: 10px;
            }
          }
        </style>
      </head>
      <body>
        <h1>📅 Gestione Turni di Riposo</h1>
        <div class="export-date">Esportato il: ${new Date().toLocaleDateString('it-IT', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</div>
        
        <div class="legend">
          <h2>👥 Legenda Persone</h2>
          ${people.map(person => 
            `<span class="legend-item" style="background-color: ${person.color}">${person.name}</span>`
          ).join('')}
        </div>
        
        <table>
          <thead>
            <tr>
              <th style="width: 30%">Data</th>
              <th style="width: 70%">Persone a Riposo</th>
            </tr>
          </thead>
          <tbody>
            ${filteredShifts.map(shift => {
              const dateFormatted = new Date(shift.date + 'T00:00:00').toLocaleDateString('it-IT', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
              
              const peopleBadges = shift.peopleIds
                .map(id => {
                  const person = people.find(p => p.id === id);
                  return person ? 
                    `<span class="person-badge" style="background-color: ${person.color}">${person.name}</span>` 
                    : '';
                })
                .join('');
              
              return `
                <tr>
                  <td><strong>${dateFormatted}</strong></td>
                  <td>${peopleBadges || '<em>Nessuno</em>'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        ${constraints.length > 0 ? `
          <div class="constraints">
            <h2>⚠️ Vincoli Attivi</h2>
            ${constraints.map(constraint => {
              const p1 = getPersonById(constraint.person1);
              const p2 = getPersonById(constraint.person2);
              return p1 && p2 ? 
                `<div class="constraint-item">• <strong>${p1.name}</strong> e <strong>${p2.name}</strong> non possono essere nello stesso turno</div>` 
                : '';
            }).join('')}
          </div>
        ` : ''}
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const filteredShifts = shifts.filter(shift => {
    const matchesPerson = !filterPerson || shift.peopleIds.includes(filterPerson);
    const matchesDate = !filterDate || shift.date.includes(filterDate);
    return matchesPerson && matchesDate;
  });

  const getPersonById = (id: number): Person | undefined => people.find(p => p.id === id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-card rounded-2xl shadow-card overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-primary p-6 text-primary-foreground">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8" />
                <h1 className="text-3xl font-bold">Gestione Turni di Riposo</h1>
              </div>
              <button
                onClick={exportToPDF}
                className="flex items-center gap-2 bg-card text-primary px-4 py-2 rounded-lg hover:shadow-lg transition-all"
              >
                <Download className="w-5 h-5" />
                Esporta PDF
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-border">
            <div className="flex">
              <button
                onClick={() => setActiveTab('shifts')}
                className={`flex-1 py-4 px-6 font-semibold transition ${
                  activeTab === 'shifts'
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <Calendar className="w-5 h-5 inline mr-2" />
                Turni
              </button>
              <button
                onClick={() => setActiveTab('people')}
                className={`flex-1 py-4 px-6 font-semibold transition ${
                  activeTab === 'people'
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <Users className="w-5 h-5 inline mr-2" />
                Persone
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {activeTab === 'shifts' && (
              <div>
                {/* Filtri e Azioni */}
                <div className="mb-6 flex flex-wrap gap-4 items-center">
                  <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-muted-foreground" />
                    <select
                      value={filterPerson || ''}
                      onChange={(e) => setFilterPerson(e.target.value ? parseInt(e.target.value) : null)}
                      className="border border-input bg-background rounded-lg px-3 py-2 focus:ring-2 focus:ring-ring focus:border-transparent"
                    >
                      <option value="">Tutte le persone</option>
                      {people.map(person => (
                        <option key={person.id} value={person.id}>{person.name}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="border border-input bg-background rounded-lg px-3 py-2 focus:ring-2 focus:ring-ring focus:border-transparent"
                  />
                  <button
                    onClick={() => { setFilterPerson(null); setFilterDate(''); }}
                    className="text-primary hover:text-primary/80 font-medium"
                  >
                    Reimposta filtri
                  </button>
                  <div className="ml-auto flex gap-2">
                    <button
                      onClick={() => setShowConstraints(!showConstraints)}
                      className="flex items-center gap-2 bg-warning text-warning-foreground px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                    >
                      <AlertCircle className="w-5 h-5" />
                      Vincoli
                    </button>
                    <button
                      onClick={() => setShowAddShift(true)}
                      className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Aggiungi Turno
                    </button>
                  </div>
                </div>

                {/* Gestione Vincoli */}
                {showConstraints && (
                  <div className="mb-6 p-4 bg-warning/10 border-2 border-warning/30 rounded-lg">
                    <h3 className="text-lg font-bold text-warning-foreground mb-3">Gestione Vincoli</h3>
                    <div className="flex flex-wrap gap-3 items-end mb-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Persona 1</label>
                        <select
                          value={selectedPerson1}
                          onChange={(e) => setSelectedPerson1(e.target.value)}
                          className="border border-input bg-background rounded-lg px-3 py-2"
                        >
                          <option value="">Seleziona...</option>
                          {people.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Persona 2</label>
                        <select
                          value={selectedPerson2}
                          onChange={(e) => setSelectedPerson2(e.target.value)}
                          className="border border-input bg-background rounded-lg px-3 py-2"
                        >
                          <option value="">Seleziona...</option>
                          {people.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={addConstraint}
                        className="bg-warning text-warning-foreground px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                      >
                        Aggiungi Vincolo
                      </button>
                    </div>
                    {constraints.length > 0 && (
                      <div className="space-y-2">
                        {constraints.map(constraint => {
                          const p1 = getPersonById(constraint.person1);
                          const p2 = getPersonById(constraint.person2);
                          return (
                            <div key={constraint.id} className="flex items-center justify-between bg-card p-3 rounded-lg">
                              <span className="text-foreground">
                                <span style={{ color: p1?.color }} className="font-semibold">{p1?.name}</span>
                                {' e '}
                                <span style={{ color: p2?.color }} className="font-semibold">{p2?.name}</span>
                                {' non possono essere nello stesso turno'}
                              </span>
                              <button
                                onClick={() => deleteConstraint(constraint.id)}
                                className="text-destructive hover:text-destructive/80"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Modal Aggiungi Turno */}
                {showAddShift && (
                  <div className="mb-6 p-4 bg-primary/10 border-2 border-primary/30 rounded-lg">
                    <h3 className="text-lg font-bold text-primary mb-3">Aggiungi Nuovo Turno</h3>
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-foreground mb-1">Data</label>
                        <input
                          type="date"
                          value={newShiftDate}
                          onChange={(e) => setNewShiftDate(e.target.value)}
                          className="w-full border border-input bg-background rounded-lg px-3 py-2 focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <button
                        onClick={addShift}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        Aggiungi
                      </button>
                      <button
                        onClick={() => setShowAddShift(false)}
                        className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Tabella Turni */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gradient-to-r from-primary/10 to-accent/10">
                        <th className="border border-border px-4 py-3 text-left font-semibold text-foreground">Data</th>
                        <th className="border border-border px-4 py-3 text-left font-semibold text-foreground">Persone a Riposo</th>
                        <th className="border border-border px-4 py-3 text-center font-semibold text-foreground w-24">Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredShifts.map(shift => (
                        <tr key={shift.id} className="hover:bg-muted/50 transition">
                          <td className="border border-border px-4 py-3 font-medium">
                            {new Date(shift.date + 'T00:00:00').toLocaleDateString('it-IT', { 
                              weekday: 'short', 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </td>
                          <td className="border border-border px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              {people.map(person => (
                                <button
                                  key={person.id}
                                  onClick={() => togglePersonInShift(shift.id, person.id)}
                                  className={`px-3 py-1 rounded-full text-white font-medium transition transform hover:scale-105 ${
                                    shift.peopleIds.includes(person.id) ? 'shadow-lg' : 'opacity-40'
                                  }`}
                                  style={{ backgroundColor: person.color }}
                                >
                                  {person.name}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="border border-border px-4 py-3 text-center">
                            <button
                              onClick={() => deleteShift(shift.id)}
                              className="text-destructive hover:text-destructive/80 transition"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'people' && (
              <div>
                <div className="mb-6">
                  <button
                    onClick={() => setShowAddPerson(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    Aggiungi Persona
                  </button>
                </div>

                {showAddPerson && (
                  <div className="mb-6 p-4 bg-primary/10 border-2 border-primary/30 rounded-lg">
                    <h3 className="text-lg font-bold text-primary mb-3">Aggiungi Nuova Persona</h3>
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-foreground mb-1">Nome</label>
                        <input
                          type="text"
                          value={newPersonName}
                          onChange={(e) => setNewPersonName(e.target.value)}
                          placeholder="Es. Marco Bianchi"
                          className="w-full border border-input bg-background rounded-lg px-3 py-2 focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Colore</label>
                        <input
                          type="color"
                          value={newPersonColor}
                          onChange={(e) => setNewPersonColor(e.target.value)}
                          className="h-10 w-20 border border-input rounded-lg cursor-pointer"
                        />
                      </div>
                      <button
                        onClick={addPerson}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                      >
                        <Check className="w-5 h-5" />
                        Aggiungi
                      </button>
                      <button
                        onClick={() => setShowAddPerson(false)}
                        className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg hover:bg-secondary/80 transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {people.map(person => (
                    <div
                      key={person.id}
                      className="p-4 border-2 rounded-lg hover:shadow-hover transition"
                      style={{ borderColor: person.color }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        {editingPerson === person.id ? (
                          <input
                            type="text"
                            defaultValue={person.name}
                            onBlur={(e) => updatePersonName(person.id, e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && updatePersonName(person.id, (e.target as HTMLInputElement).value)}
                            className="flex-1 border border-input bg-background rounded px-2 py-1 mr-2"
                            autoFocus
                          />
                        ) : (
                          <h3 className="font-bold text-lg" style={{ color: person.color }}>
                            {person.name}
                          </h3>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingPerson(editingPerson === person.id ? null : person.id)}
                            className="text-primary hover:text-primary/80"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deletePerson(person.id)}
                            className="text-destructive hover:text-destructive/80"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-foreground">Colore:</label>
                        <input
                          type="color"
                          value={person.color}
                          onChange={(e) => updatePersonColor(person.id, e.target.value)}
                          className="h-10 w-20 border border-input rounded-lg cursor-pointer"
                        />
                        <div
                          className="flex-1 h-10 rounded-lg"
                          style={{ backgroundColor: person.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftManager;
