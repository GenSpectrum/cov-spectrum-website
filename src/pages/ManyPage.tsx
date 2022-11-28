

export const ManyPage = () => {

  return <>
    {/* TODO What to do about small screens? */}
    <div style={{ // Subtracting the header  TODO It's not good to have these constants here
      height: 'calc(100vh - 72px - 2px)',
    }} className='flex flex-row'>
      {/* The parent node */}
      <div style={{ width: 300, minWidth: 300 }} className='border-2 border-solid border-red-800'>

      </div>
      {/* The main area */}
      <div className='flex-grow border-2 border-solid border-blue-800 p-12'>
        <div className='flex flex-row flex-wrap content-start'>
          {new Array(15).fill(0).map(_ => (
            <div style={{ width: 300, height: 300 }} className='border-2 border-solid border-yellow-800'>

            </div>
          ))}
        </div>
      </div>
    </div>
  </>;
}

type PositionInGrid = 'top-left-corner' | 'top-right-corner' | 'bottom-left-corner' | 'bottom-right-corner' |
  'left-edge' | 'top-edge' | 'right-edge' | 'bottom-edge' | 'center';
