const micBtn = document.getElementById('mic');
const languageSelect = document.getElementById('language');
const textArea = document.getElementById('text');
const saveTxtBtn = document.getElementById('saveTxt');
const copyTextBtn = document.getElementById('copyText');

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
  alert("Sorry, your browser doesn't support the Speech Recognition API.");
} else {
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;

  let isListening = false;

  micBtn.addEventListener('click', () => {
    if (!isListening) {
      recognition.lang = languageSelect.value;
      recognition.start();
      micBtn.textContent = "🛑 Stop Listening";
      isListening = true;
    } else {
      recognition.stop();
      micBtn.textContent = "🎤 Start Listening";
      isListening = false;
    }
  });

  recognition.onresult = (event) => {
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      let transcript = event.results[i][0].transcript.trim().toLowerCase();
      console.log("Transcript:", transcript); // Debug line

      if (event.results[i].isFinal) {
        if (transcript.includes("clear text")) {
          textArea.value = '';
          alert("🧹 Text cleared");
          continue;
        }
        if (
          transcript.includes("stop listening") ||
          
          transcript.includes("stop") 
          
        ) {
          recognition.stop();
          micBtn.textContent = "🎤 Start Listening";
          isListening = false;
          alert("🛑 Stopped listening");
          continue;
        }
        if (transcript.includes("save file") || transcript.includes("save text")) {
          saveTxtBtn.click();
          continue;
        }
        if (transcript.includes("copy text")) {
          copyTextBtn.click();
          continue;
        }

        // Replace spoken punctuation and add to textarea
        transcript = replaceSpokenPunctuation(transcript);
        textArea.value += transcript + ' ';
      }
    }
  };

  function replaceSpokenPunctuation(text) {
    return text
      .replace(/\bcomma\b/gi, ',')
      .replace(/\bperiod\b/gi, '.')
      .replace(/\bfull stop\b/gi, '.')
      .replace(/\bquestion mark\b/gi, '?')
      .replace(/\bexclamation mark\b/gi, '!')
      .replace(/\bcolon\b/gi, ':')
      .replace(/\bsemicolon\b/gi, ';')
      .replace(/\bnew line\b/gi, '\n')
      .replace(/\bdash\b/gi, '-');
  }

  recognition.onend = () => {
    if (isListening) {
      setTimeout(() => recognition.start(), 500); // Restart after slight delay
    } else {
      micBtn.textContent = "🎤 Start Listening";
    }
  };

  recognition.onerror = (event) => {
    alert('Speech recognition error: ' + event.error);
    micBtn.textContent = "🎤 Start Listening";
    isListening = false;
  };
}

// Save as .txt
saveTxtBtn.addEventListener('click', () => {
  const text = textArea.value;
  if (!text.trim()) {
    alert('No text to save!');
    return;
  }
  const blob = new Blob([text], { type: 'text/plain' });
  const anchor = document.createElement('a');
  anchor.download = 'transcription.txt';
  anchor.href = URL.createObjectURL(blob);
  anchor.click();
  URL.revokeObjectURL(anchor.href);
});

// Copy to clipboard
copyTextBtn.addEventListener('click', () => {
  const text = textArea.value;
  if (!text.trim()) {
    alert('No text to copy!');
    return;
  }
  navigator.clipboard.writeText(text)
    .then(() => alert('Copied to clipboard!'))
    .catch(() => alert('Failed to copy. Please copy manually.'));
});

// Save as PDF
document.getElementById('savePdf').addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const text = textArea.value;
  const lines = doc.splitTextToSize(text, 180);
  doc.text(lines, 10, 10);
  doc.save('transcription.pdf');
});
