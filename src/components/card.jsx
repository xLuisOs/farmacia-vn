export default function Card({ children }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, border: '1.5px solid #E2F0F4', boxShadow: '0 2px 8px rgba(11,31,75,.04)', overflow: 'hidden' }}>
      {children}
    </div>
  )
}

export function CardHeader({ title, subtitle, badge, badgeCyan = false }) {
  return (
    <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E2F0F4' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1A3A5C' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 10, color: '#6A9BB5', marginTop: 1 }}>{subtitle}</div>}
      </div>
      {badge !== undefined && (
        <span style={{ background: badgeCyan ? '#5BBFCC' : '#1A3A5C', color: badgeCyan ? '#1A3A5C' : 'white', fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>
          {badge}
        </span>
      )}
    </div>
  )
}