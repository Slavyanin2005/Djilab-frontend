export const Footer: React.FC = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.footerGrid}>
          <div>
            <h4 style={{ color: 'white', marginBottom: '20px' }}>DJILab</h4>
            <p style={{ color: '#ccc', lineHeight: 1.8 }}>
              Надёжное лабораторное оборудование премиум-класса
            </p>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '20px' }}>Каталог</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li>
                <a href="#" style={{ color: '#bbb', textDecoration: 'none' }}>
                  pH-метры
                </a>
              </li>
              <li>
                <a href="#" style={{ color: '#bbb', textDecoration: 'none' }}>
                  Весы
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '20px' }}>Контакты</h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li>
                <a href="tel:+74957775533" style={{ color: '#bbb', textDecoration: 'none' }}>
                  +7 (495) 777-55-33
                </a>
              </li>
              <li>
                <a href="mailto:info@djilab.ru" style={{ color: '#bbb', textDecoration: 'none' }}>
                  info@djilab.ru
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div
          style={{
            textAlign: 'center',
            marginTop: '64px',
            paddingTop: '32px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            color: '#888',
          }}
        >
          © 2026 ООО «DJILab»
        </div>
      </div>
    </footer>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  footer: {
    background: '#272727',
    color: '#ccc',
    padding: '80px 0 48px',
  },
  container: {
    maxWidth: '1440px',
    margin: '0 auto',
    padding: '0 32px',
  },
  footerGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr',
    gap: '48px',
  },
};
