import React, { useState } from 'react';

function AutoSuggestTextbox({
  initialSuggestions,
  inputValue,
  suggestions,
  onInputChange,
  onAddInput,
}) {
  const [showSuggestions, setShowSuggestions] = useState(false); // Add setShowSuggestions here

  const handleSelectSuggestion = (suggestion) => {
    onInputChange(suggestion);
    setShowSuggestions(false);
  };

  const handleAddInput = () => {
    if (inputValue.trim() !== '') {
      onAddInput(inputValue);
      onInputChange('');
      setShowSuggestions(false);
    }
  };

  return (
    <div>
      <h3>AutoSuggest Textbox</h3>
      <div className="autosuggest-container">
        <input
          type="text"
          placeholder="Type here..."
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          list="suggestions"
        />
        {showSuggestions && (
          <ul className="suggestions">
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                value={suggestion}
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        )}
      </div>
      <button onClick={handleAddInput}>Add Input</button>
    </div>
  );
}

export default AutoSuggestTextbox;
