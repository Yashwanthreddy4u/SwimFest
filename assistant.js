'use strict';

(function () {
  const messages = document.getElementById('assistantMessages');
  const form = document.getElementById('assistantForm');
  const input = document.getElementById('assistantInput');
  let pendingAction = null;

  function addMessage(text, role = 'bot') {
    const message = document.createElement('article');
    message.className = `assistant-message assistant-message-${role}`;
    const paragraph = document.createElement('p');
    paragraph.textContent = text;
    message.appendChild(paragraph);
    messages.appendChild(message);
    messages.scrollTop = messages.scrollHeight;
    return message;
  }

  function addLink(parent, label, href) {
    const link = document.createElement('a');
    link.href = href;
    link.textContent = label;
    parent.appendChild(link);
  }

  function queueAction(label, href, detail) {
    if (pendingAction) {
      messages.querySelectorAll('.assistant-confirmation').forEach(confirmation => confirmation.remove());
      addMessage('Your earlier confirmation was replaced. Nothing was changed.');
    }
    const action = { label, href };
    pendingAction = action;
    const message = addMessage('');
    const confirmation = document.createElement('div');
    confirmation.className = 'assistant-confirmation';

    const prompt = document.createElement('p');
    prompt.textContent = `${detail} Continue to ${label}? Nothing will be submitted by this assistant.`;
    confirmation.appendChild(prompt);

    const confirm = document.createElement('button');
    confirm.type = 'button';
    confirm.className = 'assistant-action-button assistant-confirm';
    confirm.textContent = `Yes, continue to ${label}`;
    confirm.addEventListener('click', () => {
      if (pendingAction !== action) return;
      pendingAction = null;
      window.location.assign(action.href);
    });

    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'assistant-action-button';
    cancel.textContent = 'Cancel';
    cancel.addEventListener('click', () => {
      if (pendingAction === action) {
        pendingAction = null;
        addMessage('Okay, I cancelled that. Nothing was changed.');
      }
      confirmation.remove();
    });

    confirmation.append(confirm, cancel);
    message.appendChild(confirmation);
    messages.scrollTop = messages.scrollHeight;
  }

  function actionLink(label, href, detail) {
    queueAction(label, href, detail);
  }

  function displayTournament(tournament) {
    const card = document.createElement('section');
    card.className = 'assistant-event';
    const title = document.createElement('h2');
    title.textContent = tournament.title;
    const details = document.createElement('p');
    const location = [tournament.venue_name, tournament.city, tournament.state]
      .filter(Boolean).join(', ');
    const dates = tournament.start_date
      ? new Date(`${tournament.start_date}T00:00:00`).toLocaleDateString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
      }) + (tournament.end_date
        ? ` – ${new Date(`${tournament.end_date}T00:00:00`).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'short', year: 'numeric',
        })}`
        : '')
      : 'Date not listed';
    details.textContent = `${location || 'Location not listed'} · ${dates} · ${tournament.status}`;
    card.append(title, details);
    addLink(card, 'View tournament details', `event.html?id=${encodeURIComponent(tournament.tournament_id)}`);

    if (tournament.status === 'PUBLISHED') {
      const register = document.createElement('button');
      register.type = 'button';
      register.className = 'assistant-action-button';
      register.textContent = 'Continue to registration';
      register.addEventListener('click', () => {
        actionLink(
          'registration',
          `register.html?tournament=${encodeURIComponent(tournament.title)}&from=assistant`,
          `You asked to register for ${tournament.title}.`,
        );
      });
      card.appendChild(register);
    }
    messages.appendChild(card);
    messages.scrollTop = messages.scrollHeight;
  }

  function searchTerms(text) {
    const stopWords = new Set([
      'i', 'want', 'to', 'can', 'you', 'could', 'would', 'like', 'please', 'me', 'my', 'we',
      'what', 'where', 'when', 'which', 'is', 'are', 'was', 'were', 'do', 'does', 'did', 'about',
    ]);
    return text.toLowerCase()
      .replace(/\b(find|search|show|list|look up|tell|about|upcoming|available|tournaments?|meets?|competitions?|swim(?:ming)?|events?|near|nearby|around|close|in|at|for|by|from|please|me|the|a|an)\b/g, ' ')
      .replace(/[?!.,]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(term => term.length > 1 && !stopWords.has(term));
  }

  async function searchTournaments(text) {
    if (!window.sb) {
      addMessage('Tournament search is unavailable because the database connection is not configured. Please use the tournament list on the home page.');
      addLink(messages.lastElementChild, 'Browse tournaments', 'index.html#upcoming-tournaments');
      return;
    }

    const statusMessage = addMessage('Searching public tournament listings…');
    const { data, error } = await window.sb
      .from('tournaments')
      .select('tournament_id, title, venue_name, city, state, start_date, end_date, status')
      .in('status', ['PUBLISHED', 'CLOSED', 'LOCKED', 'COMPLETED'])
      .order('start_date', { ascending: true })
      .limit(100);

    if (error) {
      console.error('[Ask Zuno] tournament search failed:', error.message);
      statusMessage.querySelector('p').textContent = `Tournament search failed: ${error.message}`;
      return;
    }

    const terms = searchTerms(text);
    const isUpcoming = /\b(upcoming|future)\b/.test(text.toLowerCase());
    const localDate = new Date();
    const today = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
    const matches = (data || []).filter(tournament => {
      const haystack = [tournament.title, tournament.venue_name, tournament.city, tournament.state, tournament.start_date, tournament.end_date]
        .filter(Boolean).join(' ').toLowerCase();
      const dateMatches = !isUpcoming ||
        (tournament.start_date && tournament.start_date >= today && tournament.status !== 'COMPLETED');
      return dateMatches && terms.every(term => haystack.includes(term));
    });
    statusMessage.querySelector('p').textContent = matches.length
      ? `I found ${matches.length} matching tournament${matches.length === 1 ? '' : 's'}${matches.length > 10 ? ' (showing the first 10)' : ''}:`
      : 'I could not find a matching tournament. Try a different name, city, venue, or state, or browse the full list.';

    matches.slice(0, 10).forEach(displayTournament);
    if (!matches.length) addLink(statusMessage, 'Browse tournaments', 'index.html#upcoming-tournaments');
  }

  function handleMessage(rawText) {
    const text = rawText.trim();
    const normalized = text.toLowerCase();
    if (!text) return;

    pendingAction = null;
    messages.querySelectorAll('.assistant-confirmation').forEach(confirmation => confirmation.remove());
    addMessage(text, 'user');

    if (/\b(cancel|never mind|nevermind)\b/.test(normalized)) {
      addMessage('There is no pending action. Nothing was changed.');
      return;
    }

    if (/\b(heat generation|heat gen)\b/.test(normalized) ||
        (/\b(generate|create|build|publish|configure|manage)\b/.test(normalized) && /\b(heat|heats|heat sheet|heat sheets)\b/.test(normalized))) {
      actionLink('heat generation', 'heatgen.html', 'This opens the role-protected heat-generation tool. Review the generated heats; publishing has its own confirmation step.');
      return;
    }

    if (/\b(create|host|organize|organise|new)\b/.test(normalized) && /\b(tournament|meet|event)\b/.test(normalized)) {
      actionLink('event creation', 'orgcreate.html', 'This opens the organizer event-creation workflow. You may need to sign in as an organizer.');
      return;
    }

    if (/\b(swimmer|swimmers|athlete|profile)\b/.test(normalized) && /\b(search|find|look|directory|show)\b/.test(normalized)) {
      const query = text.replace(/\b(search|find|look up|show|swimmer|swimmers|athlete|profile|directory|please|me|for)\b/gi, '').trim();
      window.location.assign(query ? `search.html?q=${encodeURIComponent(query)}` : 'search.html');
      return;
    }

    if (/\b(tournament|tournaments|meet|meets|competition|competitions|event|events)\b/.test(normalized) &&
        /\b(find|search|show|list|tell|about|near|around|upcoming|available|in)\b/.test(normalized)) {
      searchTournaments(text);
      return;
    }

    if (/\b(register|registration|sign up|enter)\b/.test(normalized) && /\b(tournament|meet|event|swim|register)\b/.test(normalized)) {
      actionLink('tournament registration', 'register.html', 'This opens the registration workflow. You will review the event and swimmer details before submitting.');
      return;
    }

    if (/\b(heat sheet|heat sheets|schedule|result|results)\b/.test(normalized)) {
      addMessage('You can view published schedules and results here.');
      addLink(messages.lastElementChild, 'Open heat sheets and results', 'heatsheets.html');
      return;
    }

    if (/\b(academy|academies|coach|coaches)\b/.test(normalized)) {
      addMessage('Browse SwimFest academies and coaches here.');
      addLink(messages.lastElementChild, 'Open academy directory', 'academy.html');
      return;
    }

    if (/\b(help|what can you do|options)\b/.test(normalized)) {
      addMessage('I can search public tournaments, open swimmer and academy directories, show published heat sheets, and guide you to tournament registration, event creation, or heat generation. I ask before continuing to create, register, or heat-publishing tasks.');
      return;
    }

    addMessage('I can help with tournament search, event creation, registration, heat generation, heat sheets/results, swimmer search, or the academy directory. What would you like to do?');
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const text = input.value;
    if (!text.trim()) return;
    input.value = '';
    handleMessage(text);
  });

  document.querySelectorAll('.assistant-suggestions [data-prompt]').forEach(button => {
    button.addEventListener('click', () => handleMessage(button.dataset.prompt));
  });
})();
