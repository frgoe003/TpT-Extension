document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);

range = document.getElementById('range'),
rangeV = document.getElementById('rangeV'),
setValue = ()=>{
    const newValue = Number( (range.value - range.min) * 100 / (range.max - range.min) ),
    newPosition = 10 - (newValue * 0.2);
    rangeV.innerHTML = `<span>${range.value}</span>`;
    rangeV.style.left = `calc(${newValue}% + (${newPosition}px))`;
};

document.addEventListener("DOMContentLoaded", setValue);
range.addEventListener('input', setValue);


// Saves options to chrome.storage
function save_options() {
  console.log(range.value);
  var range_val = range.value;

  var color = document.getElementById('color').value;
  var likesColor = document.getElementById('like').checked;

  chrome.storage.sync.set({
    lastSalesCount: range_val,
    favoriteColor: color,
    likesColor: likesColor
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.sync.get({
    favoriteColor: 'red',
    likesColor: true
  }, function(items) {
    document.getElementById('color').value = items.favoriteColor;
    document.getElementById('like').checked = items.likesColor;
  });
}
