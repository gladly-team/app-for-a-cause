/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.html"],
      experimental: {
        modernSelector: true,
      },
      theme: {
          container: {
              center: true,
              padding: {
                  DEFAULT: '16px',
              },
              screens: {
                  sm: '1405px',
              },
          },
          screens: {
              sm: '320px',
              smd: '375px',
              md: '768px',
              lg: '1024px',
              'container' : '1405px',
              xl: '1231px',
              '2xl': '1440px',
          },
          colors: {
              transparent: 'transparent',
              current: 'currentColor',
              'black': '#000',
              'black-40': 'rgba(0, 0, 0, .4)',
              'white': '#fff',
              'gray': '#757575',
              'gray-c1': "#D9D9D9",
              'gray-c2': "#98979A",
              'gray-c3': "rgba(29,27,32,0.12)",
              'gray-c4': "#F8F8F8",
              'gray-c5': "#cfd4e2",
              'blue-light-1': '#ECF1FF',
              'blue-light-2': '#E2E8F9',
              'blue-light-3': '#60719E',
              'blue-light-3-30': 'rgba(96, 113, 158, .3)',
              'blue-medium-2': '#E2E8F9',
              'blue-fb': '#1877F2',
              'red-mail': '#DB4537',
              'purple-1': "#9747FF",
              'pink-1': "rgba(255, 71, 191, 1)",
              'pink-1-20': "rgba(255, 71, 191, 0.2)",
              'red-1': "rgba(255, 89, 89, 1)",
              'red-1-20': "rgba(255, 89, 89, 0.2)",
              'red-2': "rgba(255, 71, 71, 1)",
              'green': "#3BA376",
          },
          fontFamily: {
              sans: ['Roboto', 'sans-serif'],
              inter: ['Inter', 'sans-serif'],
          },
          fontSize: {
              "5xl": "3rem",
              "4xl": "3rem",
              "3xl": "3rem",
              "1.5xl": "1.5rem",
              "1.125xl": "1.125rem",
              "1xl": "1rem",
              "sm": ".875rem",
              "xs": ".75rem",
              "normal": "16px",
              'inherit' : 'inherit',
          },
          extend: {
              lineHeight: {
                  'inherit' : 'inherit',
                  'xs' : '1',
                  'sm' : '1.14',
                  'md' : '1.17',
                  'lg' : '1.3',
                  'xl' : '1.42',
                  'normal': '1.25',
                  'tight' : '1.22',
              },
              padding: {
                  '3.25' : '3.25rem',
                  '18' : '4.55rem',
                  '17' : '4.4rem',
                  '15' : '3.03rem',
              },
              borderRadius: {
                  '4xl': '1.75rem',
                  '50per': '50%'
              },
              spacing: {
                  '0625': '.0625rem',
                  '0687': '.687rem',
                  '045': '0.45rem',
                  '035': '0.35rem',
                  '1.875': '1.85rem',
                  '43per': '43%'
              },
              height: {
                'medium': '27.94rem',
                "26": "1.625rem",
              },
              width: {
                "22": "4.4rem",
                "26": "1.625rem",

              },
              boxShadow: {
                'purple-1': 'inset 0 0 0 2px #9747FF',
                'gray-1': 'inset 0 0 0 1px #D9D9D9',
                'gray-2': '0 -4px 12px 0 rgba(0, 0, 0, 0.04)',
                'xs': '0 1px 5px 0 rgba(0, 0, 0, 0.25)',
                'base': '0 4px 4px 0 rgba(0, 0, 0, 0.05)'
              },
              backgroundImage: {
                  'popup-bg-shapes': "url('../assets/images/svg/shapes.svg')",
                  'check-disabled': "url('../assets/images/svg/check-disabled.svg')",
                  'check-active': "url('../assets/images/svg/check-active.svg')",
                  'green-orange': "linear-gradient(90deg, rgba(107,185,102,1) 0%, rgba(255,164,27,1) 100%)",
                  'green-fade': "linear-gradient(180deg, rgba(107,185,102,0) 0%, rgba(107,185,102,.1) 100%)",
                  'red-purple': "linear-gradient(90deg, rgba(255, 71, 71, 1) 0%, rgba(255, 71, 191, 1) 100%)",
                  'red-fade': "linear-gradient(180deg, rgba(255, 71, 71, .1) 0%, rgba(255, 71, 71, 0) 100%)",
              },
              letterSpacing: {
                  small: '0.005em',    
                  base: '0.01em',
                  normal: '0.02em',
                  wide: '0.03em',
              },
              keyframes: {
                fadeOutUp: {
                  '0%': { opacity: '1', transform: 'translateY(-50%)' },
                  '100%': { opacity: '0', transform: 'translateY(-200%)' },
                },
                fillCircleReverse: {
                  '0%': { strokeDasharray: '100 0' },
                  '100%': { strokeDasharray: '0 100' },
                }
              },
              animation: {
                fadeOutUp: 'fadeOutUp .7s 2s forwards',
                fillCircleReverse: 'fillCircleReverse 8s linear forwards',
              },
          },
      }
  }  