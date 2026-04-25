import { Phone, Edit2, Trash2, Star } from 'lucide-react'
import { formatPhone, getInitials } from '../utils/formatters'

const tierColors = {
  1: 'var(--accent-red)',
  2: 'var(--accent-amber)',
  3: 'var(--accent-blue)'
}

const tierLabels = {
  1: 'Priority',
  2: 'Secondary',
  3: 'Backup'
}

const tierGradients = {
  1: 'linear-gradient(135deg, #F43F5E, #E11D48)',
  2: 'linear-gradient(135deg, #F59E0B, #D97706)',
  3: 'linear-gradient(135deg, #818CF8, #6366F1)'
}

export default function ContactCard({ contact, onEdit, onDelete, index = 0 }) {
  return (
    <div className="contact-card animate-fadeInUp" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="contact-avatar" style={{ background: tierGradients[contact.tier] }}>
        {getInitials(contact.name)}
      </div>

      <div className="contact-info">
        <div className="contact-name-row">
          <span className="contact-name">{contact.name}</span>
          {contact.tier === 1 && <Star size={13} fill="var(--accent-amber)" color="var(--accent-amber)" />}
        </div>
        <span className="contact-phone">{formatPhone(contact.phone)}</span>
        <span className="contact-tier" style={{ color: tierColors[contact.tier] }}>
          {tierLabels[contact.tier]} Contact
        </span>
      </div>

      <div className="contact-actions">
        <a href={`tel:${contact.phone}`} className="contact-action-btn call">
          <Phone size={15} />
        </a>
        {onEdit && (
          <button className="contact-action-btn edit" onClick={() => onEdit(contact)}>
            <Edit2 size={15} />
          </button>
        )}
        {onDelete && (
          <button className="contact-action-btn delete" onClick={() => onDelete(contact.id)}>
            <Trash2 size={15} />
          </button>
        )}
      </div>

      <style>{`
        .contact-card {
          display: flex;
          align-items: center;
          gap: var(--space-md);
          padding: 14px 18px;
          background: var(--glass-bg);
          border: 1px solid var(--glass-border);
          border-radius: var(--radius-xl);
          transition: all var(--transition-base);
          backdrop-filter: blur(12px);
          position: relative;
          overflow: hidden;
        }
        .contact-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
        }
        .contact-card:hover {
          background: var(--glass-bg-hover);
          border-color: var(--glass-border-strong);
          transform: translateX(4px);
        }
        .contact-avatar {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 15px;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .contact-info {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .contact-name-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .contact-name {
          font-weight: 600;
          font-size: 14px;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .contact-phone {
          font-size: var(--font-size-sm);
          color: var(--text-secondary);
        }
        .contact-tier {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .contact-actions {
          display: flex;
          gap: 5px;
          flex-shrink: 0;
        }
        .contact-action-btn {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-md);
          border: 1px solid var(--glass-border);
          background: var(--glass-bg);
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all var(--transition-fast);
          text-decoration: none;
        }
        .contact-action-btn.call:hover {
          background: rgba(16, 185, 129, 0.12);
          color: var(--accent-green);
          border-color: rgba(16, 185, 129, 0.2);
        }
        .contact-action-btn.edit:hover {
          background: rgba(99, 102, 241, 0.12);
          color: var(--accent-blue);
          border-color: rgba(99, 102, 241, 0.2);
        }
        .contact-action-btn.delete:hover {
          background: rgba(244, 63, 94, 0.12);
          color: var(--accent-red);
          border-color: rgba(244, 63, 94, 0.2);
        }
      `}</style>
    </div>
  )
}
