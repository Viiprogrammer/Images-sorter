// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const type of ['chrome', 'node', 'electron']) {
    replaceText(`${type}-version`, process.versions[type])
  }
  $("#input").click(function () {
    chooseInput();
  })
  $("#output").click(function () {
    chooseOutput();
  });
  $("#back").click(function () {
    goBack();
  });

  $("#next").click(function () {
    if((!output || !output.length) || (!input || !input.length)){
      setError({
        selector:'#alert_msg',
        text: '<strong>Error!</strong> Empty input directory or input/output directory not selected',
        timeout:3000
      })
      return false;
    }
    $('#settings').addClass('d-none');
    $('#image').attr('src', path.join(input, getInputFiles()[0]));
    renderButtons();
    $('#sort').removeClass('d-none')
  })
})
