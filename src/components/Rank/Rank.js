import React from 'react';

const Rank = ({ name, entries, 'data-testid': dataTestId }) => {
    return (
        <div data-testid={dataTestId}>
            <div className='white f3'>
                {`${name}, your current rank is...`}
            </div>
            <div className='white f1'>
                {entries}
            </div>
        </div>
    );
}

export default Rank;