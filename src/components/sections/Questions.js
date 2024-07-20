import { useState } from 'react';
import '../styles/Questions.css';
import { CarbCounter } from './CarbCounter';

export const Questions = () => {
  const [flicker, setFlicker] = useState(true);
  const [carbsEatenNumerical, setCarbsEatenNumerical] = useState(null);

  const toggleMoreInfo = () => {
    setFlicker(!flicker);
  };

  const clearForm = () => {
    document.getElementById('form').reset();
  };

  const submitData = () => {
    const formData = {
      insulinInjected: document.getElementById('insulinInjected').value,
      levelBefore: document.getElementById('levelBefore').value,
      levelTwo: document.getElementById('levelTwo').value,
      time: document.getElementById('time').value,
      carbsTwo: document.getElementById('carbsTwo').value,
      exercisePoints: document.getElementById('exercisePoints').value,
      alcoholPoints: document.getElementById('alcoholPoints').value,
      exercisePointsAfter: document.getElementById('exercisePointsAfter').value,
      carbsEatenNumerical: carbsEatenNumerical
    };

    const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfF2iyF_ZyY6MEgW0OCpSzb9Bg95Tr8CR15NpgZbyn6hJe-Cg/formResponse";
    const params = new URLSearchParams({
      "entry.500461883": formData.carbsEatenNumerical,
      "entry.901867602": formData.insulinInjected,
      "entry.1878110065": formData.levelBefore,
      "entry.965549412": formData.levelTwo,
      "entry.1268161372": formData.time,
      "entry.868671801": formData.carbsTwo,
      "entry.370463474": formData.exercisePoints,
      "entry.831293466": formData.alcoholPoints,
      "entry.348402611": formData.exercisePointsAfter
    });

    const url = `${formUrl}?${params.toString()}`;
    fetch(url, {
      method: 'POST',
      mode: 'no-cors'
    }).then(() => {
      alert('Data submitted successfully!');
    }).catch((error) => {
      console.error('Error:', error);
    });

    clearForm();
  };

  const Question = ({ question, id }) => {
    return (
      <div className={`section ${id}`}>
        <h3>{question}</h3>
        <input className='question_input' id={id} />
      </div>
    );
  };

  return (
    <div className='application_inner'>
      <CarbCounter setCarbsEatenNumerical={setCarbsEatenNumerical} />
      <form className='application_form' id="form">
        <Question question='How much insulin did you inject?' id='insulinInjected' />
        <Question question='What was your level before the meal?' id='levelBefore' />
        <Question question='What was your level 2 hours after the meal?' id='levelTwo' />
        <Question question='What was the time when you ate?' id='time' />
        <Question question='How many carbs did you have within the 2 hours after your meal?' id='carbsTwo' />

        <div className="section exercise_points">
          <div className="exercise_points_inner">
            <h3>How many exercise points do you have in the previous 24 hours?</h3>
            <p className="information_icon" onClick={toggleMoreInfo}>{flicker ? 'i' : 'x'}</p>
          </div>
          {!flicker && <p className="more_information">Extreme, moderate and relaxed have 3, 2, 1 points per hour respectively.</p>}
          <input className='question_input' id="exercisePoints" />
        </div>

        <Question question='How many units of alcohol have you consumed in the previous 24 hours?' id='alcoholPoints' />
        <Question question='How many exercise points do you have within the 2 hours after your meal?' id='exercisePointsAfter' />

        <div className="section submit">
          <button type="button" className="submit-button" onClick={submitData}>Submit data</button>
        </div>
      </form>
    </div>
  );
};
