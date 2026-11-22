    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
            display: ['"Outfit"', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
          },
          colors: {
            brand: {
              blue: '#1E3A8A',       // Royal blue
              darkBlue: '#0F172A',
              royal: '#2563EB',
              sky: '#EFF6FF',
              pastelBlue: '#E0E7FF',
              amber: '#F59E0B',
              emerald: '#10B981',
              rose: '#F43F5E'
            }
          },
          boxShadow: {
            'soft': '0 10px 30px -5px rgba(30, 58, 138, 0.08), 0 4px 12px -2px rgba(30, 58, 138, 0.04)',
            'card': '0 12px 35px -8px rgba(30, 64, 175, 0.10)',
            'floating': '0 20px 40px -10px rgba(30, 58, 138, 0.18)',
            'glow-blue': '0 8px 25px -4px rgba(37, 99, 235, 0.45)',
          }
        }
      }
    }
