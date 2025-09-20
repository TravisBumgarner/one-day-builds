import { UNITS, convertVolume } from '../../../utilities'

const UnitTable = () => {
  const formatValue = (value: number): string => {
    // Format to 3 decimal places and remove trailing zeros
    return parseFloat(value.toFixed(3)).toString()
  }

  return (
    <div className="unit-conversion-table">
      <h2>Unit Conversion Table</h2>
      <p>Shows how 1 unit of each type converts to other units</p>

      <table
        style={{
          borderCollapse: 'collapse',
          width: '100%',
          marginTop: '20px',
          border: '1px solid #ddd'
        }}
      >
        <thead>
          <tr style={{ backgroundColor: '#f5f5f5' }}>
            <th
              style={{
                border: '1px solid #ddd',
                padding: '12px',
                textAlign: 'left',
                fontWeight: 'bold'
              }}
            >
              From → To
            </th>
            {UNITS.map(toUnit => (
              <th
                key={toUnit}
                style={{
                  border: '1px solid #ddd',
                  padding: '12px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  textTransform: 'capitalize'
                }}
              >
                {toUnit}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {UNITS.map(fromUnit => (
            <tr
              key={fromUnit}
              style={{
                backgroundColor: fromUnit === 'cup' ? '#f9f9f9' : 'white'
              }}
            >
              <td
                style={{
                  border: '1px solid #ddd',
                  padding: '12px',
                  fontWeight: 'bold',
                  textTransform: 'capitalize',
                  backgroundColor: '#f5f5f5'
                }}
              >
                1 {fromUnit}
              </td>
              {UNITS.map(toUnit => {
                const convertedValue = convertVolume(1, fromUnit, toUnit)
                const isIdentity = fromUnit === toUnit

                return (
                  <td
                    key={`${fromUnit}-${toUnit}`}
                    style={{
                      border: '1px solid #ddd',
                      padding: '12px',
                      textAlign: 'center',
                      backgroundColor: isIdentity ? '#e8f5e8' : 'transparent',
                      fontWeight: isIdentity ? 'bold' : 'normal'
                    }}
                  >
                    {formatValue(convertedValue)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <h3>Quick Reference:</h3>
        <ul>
          <li>1 cup = 16 tablespoons = 48 teaspoons</li>
          <li>1 tablespoon = 3 teaspoons</li>
          <li>1 teaspoon = 0.333 tablespoons = 0.021 cups</li>
        </ul>
      </div>
    </div>
  )
}

export default UnitTable
