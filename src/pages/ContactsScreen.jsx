import { useState } from 'react'
import { useEmergency } from '../contexts/EmergencyContext'
import ContactCard from '../components/ContactCard'
import BackButton from '../components/BackButton'
import { Plus, X, UserPlus, Users, Search, Shield } from 'lucide-react'

export default function ContactsScreen() {
  const { contacts, addContact, updateContact, deleteContact } = useEmergency()
  const [showForm, setShowForm] = useState(false)
  const [editingContact, setEditingContact] = useState(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [relationship, setRelationship] = useState('')
  const [search, setSearch] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name || !phone) return
    if (editingContact) {
      updateContact(editingContact.id, { name, phone, relationship })
    } else {
      addContact({ name, phone, relationship })
    }
    resetForm()
  }

  const handleEdit = (contact) => {
    setEditingContact(contact)
    setName(contact.name)
    setPhone(contact.phone)
    setRelationship(contact.relationship || '')
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingContact(null)
    setName('')
    setPhone('')
    setRelationship('')
  }

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  )

  return (
    <div className="page" id="contacts-screen">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <BackButton />
          <h1 className="page-title">Contacts</h1>
        </div>
        <button className="contacts-add-btn" onClick={() => setShowForm(true)} id="add-contact-btn">
          <Plus size={18} />
        </button>
      </div>

      {/* Tier info */}
      <div className="contacts-tiers animate-fadeInUp">
        <div className="contacts-tier-chip" style={{ '--tier-color': 'var(--accent-red)' }}>
          <span className="contacts-tier-dot" />
          Priority ({contacts.filter(c => c.tier === 1).length})
        </div>
        <div className="contacts-tier-chip" style={{ '--tier-color': 'var(--accent-amber)' }}>
          <span className="contacts-tier-dot" />
          Secondary ({contacts.filter(c => c.tier === 2).length})
        </div>
        <div className="contacts-tier-chip" style={{ '--tier-color': 'var(--accent-blue)' }}>
          <span className="contacts-tier-dot" />
          Backup ({contacts.filter(c => c.tier === 3).length})
        </div>
      </div>

      {/* Search */}
      {contacts.length > 0 && (
        <div className="contacts-search animate-fadeInUp">
          <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input type="text" placeholder="Search contacts..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="contacts-search-input"
          />
        </div>
      )}

      {/* Contact List */}
      <div className="contacts-list">
        {filtered.length === 0 && contacts.length === 0 ? (
          <div className="empty-state animate-fadeInUp">
            <div className="empty-state-icon">
              <Users size={32} />
            </div>
            <p className="empty-state-title">No Emergency Contacts</p>
            <p className="empty-state-desc">
              Add your trusted contacts who will be alerted during emergencies
            </p>
            <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={() => setShowForm(true)}>
              <UserPlus size={17} /> Add First Contact
            </button>
          </div>
        ) : (
          filtered.map((contact, i) => (
            <ContactCard key={contact.id} contact={contact} index={i}
              onEdit={handleEdit} onDelete={deleteContact}
            />
          ))
        )}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h3 className="modal-title" style={{ marginBottom: 2 }}>{editingContact ? 'Edit Contact' : 'Add Contact'}</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Emergency contact details</p>
              </div>
              <button onClick={resetForm} style={{ 
                background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                borderRadius: '10px', color: 'var(--text-muted)', cursor: 'pointer',
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Full Name</label>
                <input className="input" type="text" placeholder="John Doe" value={name}
                  onChange={e => setName(e.target.value)} required id="contact-name-input"
                />
              </div>
              <div className="input-group">
                <label>Phone Number</label>
                <input className="input" type="tel" placeholder="+1 234 567 8900" value={phone}
                  onChange={e => setPhone(e.target.value)} required id="contact-phone-input"
                />
              </div>
              <div className="input-group">
                <label>Relationship (optional)</label>
                <input className="input" type="text" placeholder="Friend, Family, etc." value={relationship}
                  onChange={e => setRelationship(e.target.value)} id="contact-relationship-input"
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 12 }}
                id="contact-save-btn"
              >
                <Shield size={16} /> {editingContact ? 'Update Contact' : 'Add Contact'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .contacts-add-btn {
          width: 42px;
          height: 42px;
          border-radius: var(--radius-lg);
          background: var(--gradient-blue);
          border: none;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-base);
          box-shadow: 0 4px 16px rgba(99,102,241,0.25);
        }
        .contacts-add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.35);
        }
        .contacts-tiers {
          display: flex;
          gap: 8px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }
        .contacts-tier-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary);
          letter-spacing: 0.01em;
        }
        .contacts-tier-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--tier-color);
          box-shadow: 0 0 6px var(--tier-color);
        }
        .contacts-search {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          margin-bottom: 16px;
          transition: all var(--transition-base);
        }
        .contacts-search:focus-within {
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .contacts-search-input {
          flex: 1;
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 14px;
          outline: none;
          font-family: var(--font-family);
        }
        .contacts-search-input::placeholder { color: var(--text-muted); }
        .contacts-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
      `}</style>
    </div>
  )
}
