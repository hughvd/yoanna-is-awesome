# LSAT Study Companion 📚

A personalized website to help your girlfriend stay motivated and organized during LSAT preparation! Features include a countdown timer, daily challenges, study streak tracking, a Pomodoro timer, and motivational quotes.

## ✨ Features

- **📅 LSAT Countdown**: Live countdown showing days, hours, minutes, and seconds until test day
- **💪 Motivational Quotes**: Rotating inspirational messages to keep spirits high
- **🧩 Daily Challenge**: LSAT-style logic puzzles and questions that rotate daily
- **🔥 Study Streak Tracker**: Track consecutive study days with milestone celebrations
- **⏱️ Pomodoro Timer**: 25-minute focused study sessions with 5-minute breaks
- **🎯 Score Goal Visualization**: Display target LSAT score with progress tracking
- **💌 Personal Messages**: Custom messages that appear on specific dates or milestones

## 🚀 Quick Start

### 1. Customize the Configuration

Edit the `config.json` file to personalize the website:

```json
{
  "lsatDate": "2026-06-15T09:00:00",  // Change to actual LSAT date
  "targetScore": 170,                  // Set target score
  "timerDurations": {                  // Customize Pomodoro timer
    "workMinutes": 25,
    "breakMinutes": 5
  },
  "motivationalQuotes": [...],         // Add/edit quotes
  "personalMessages": [...],           // Add personal messages
  "dailyQuestions": [...]              // Add LSAT questions
}
```

#### Setting the LSAT Date

Change the `lsatDate` to match the actual test date in ISO format:

```json
"lsatDate": "2026-06-15T09:00:00"
```

Format: `YYYY-MM-DDTHH:MM:SS` (The time should be the test start time)

#### Setting the Target Score

The LSAT score ranges from 120-180. Set the target:

```json
"targetScore": 170
```

#### Customizing Timer Durations

Change the Pomodoro timer durations (in minutes):

```json
"timerDurations": {
  "workMinutes": 25,    // Study session length
  "breakMinutes": 5     // Break length
}
```

**Note:** Users can also customize timer durations directly on the website by clicking "⚙️ Customize Timer Durations" in the Study Mode section!

#### Adding Motivational Quotes

Add as many quotes as you want to the `motivationalQuotes` array:

```json
"motivationalQuotes": [
  "Your first quote here!",
  "Another inspiring message!",
  "Keep them coming!"
]
```

The website will randomly display one quote at a time, with a button to show a new quote.

#### Adding Personal Messages

Personal messages appear based on triggers (specific dates, countdown milestones, or streak achievements):

```json
"personalMessages": [
  {
    "trigger": "daysUntil",
    "value": 30,
    "message": "Only 30 days left! You've got this! 💙"
  },
  {
    "trigger": "streak",
    "value": 7,
    "message": "A full week of studying! So proud of you! 🔥"
  },
  {
    "trigger": "date",
    "value": "2026-03-01",
    "message": "Happy March! Keep up the amazing work! 🌸"
  }
]
```

**Trigger Types:**
- `daysUntil`: Shows when X days remain until the LSAT
- `streak`: Shows when study streak reaches X days
- `date`: Shows on a specific calendar date (format: `YYYY-MM-DD`)

#### Adding Daily Questions

Add LSAT-style practice questions:

```json
"dailyQuestions": [
  {
    "id": 1,
    "type": "logic_puzzle",
    "question": "Your question here...",
    "answer": "The answer...",
    "explanation": "Detailed explanation of why..."
  }
]
```

**Question Types:**
- `logic_puzzle`: General logic puzzles
- `logical_reasoning`: LSAT logical reasoning questions
- `analytical_reasoning`: Logic games style questions
- `reading_comp`: Reading comprehension questions
- `riddle`: Brain teasers and riddles
- `argument`: Argument analysis questions

The website shows one question per day, cycling through your list. Users can navigate to previous/next questions.

### 2. Test Locally

**Important:** Due to browser security (CORS), you need to run a local web server to test the site. Simply opening the HTML file won't work properly.

**Quick Start (Recommended):**
```bash
./start-server.sh
```

Then open your browser to: `http://localhost:8000`

**Manual Method:**
```bash
python3 -m http.server 8000
```

Then open your browser to: `http://localhost:8000`

Press `Ctrl+C` to stop the server when you're done.

Make sure all features work as expected!

## 🌐 Deploy to GitHub Pages

### Option 1: Deploy from Main Branch (Recommended)

1. **Create a GitHub repository**
   - Go to [GitHub](https://github.com) and create a new repository
   - Name it something like `lsat-companion` or `yoanna-lsat`

2. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: LSAT Study Companion"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Click "Settings" → "Pages" (in the left sidebar)
   - Under "Source", select "main" branch
   - Click "Save"
   - Your site will be live at: `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/`

### Option 2: Deploy from a Specific Folder

If you want to keep source files separate from the deployed site:

1. Follow steps 1-2 above
2. In Settings → Pages, select "main" branch and `/` (root) or `/docs` if you organize it that way
3. Push changes and wait a few minutes for deployment

### Updating the Site

After making changes to `config.json` or any files:

```bash
git add .
git commit -m "Update: describe your changes"
git push
```

GitHub Pages will automatically redeploy your site within a few minutes.

## 🎨 Customization

### Changing Colors

Edit `css/style.css` and modify the CSS variables at the top:

```css
:root {
    --primary-color: #6366f1;     /* Main theme color */
    --secondary-color: #8b5cf6;   /* Secondary theme color */
    --accent-color: #ec4899;      /* Accent color for highlights */
    /* ... more colors ... */
}
```

### Changing Timer Durations

To change Pomodoro timer durations, edit `js/timer.js`:

```javascript
durations: {
    work: 25 * 60,  // Change 25 to desired work minutes
    break: 5 * 60   // Change 5 to desired break minutes
}
```

## 📱 Mobile Friendly

The site is fully responsive and works great on phones and tablets! All features are accessible on mobile devices.

## 🔒 Privacy & Data

All data is stored locally in the browser using LocalStorage:
- Study streaks
- Timer sessions
- Answered questions
- Dismissed messages

**No data is sent to any server.** Everything stays on the device. Clearing browser data will reset progress.

## 🐛 Troubleshooting

### Countdown shows 00:00:00:00
- Check that `lsatDate` in `config.json` is set to a future date
- Ensure the date format is correct: `YYYY-MM-DDTHH:MM:SS`

### Quotes not showing
- Verify `motivationalQuotes` array in `config.json` has at least one quote
- Check for JSON syntax errors (missing commas, quotes, brackets)

### Questions not loading
- Ensure `dailyQuestions` array has at least one question
- Verify each question has `id`, `type`, `question`, `answer`, and `explanation` fields

### Personal messages not appearing
- Check that trigger conditions are met (right date, streak count, or days until)
- Verify the message wasn't already dismissed (stored in LocalStorage)
- Clear browser data to reset dismissed messages

### JSON syntax errors
- Use a JSON validator (search "JSON validator" online) to check `config.json`
- Common issues: missing commas, extra commas at end of arrays, unmatched brackets
- Ensure all strings are wrapped in double quotes `"like this"`

## 💡 Tips

1. **Add new questions regularly** to keep content fresh
2. **Write heartfelt personal messages** for key milestones
3. **Update motivational quotes** based on what resonates most
4. **Encourage daily visits** to maintain the study streak
5. **Test all changes locally** before pushing to GitHub

## 📝 File Structure

```
yoanna-law-website/
├── index.html              # Main HTML file
├── config.json            # Configuration (quotes, questions, dates)
├── README.md              # This file!
├── .gitignore            # Git ignore rules
├── css/
│   └── style.css         # All styling
└── js/
    ├── app.js            # Main application logic
    ├── countdown.js      # Countdown timer
    ├── streak.js         # Streak tracking
    ├── timer.js          # Pomodoro timer
    ├── questions.js      # Daily questions system
    └── storage.js        # LocalStorage utilities
```

## 🎓 Adding More Features

The codebase is organized into modules, making it easy to add features:

- Edit `index.html` to add new sections
- Add styling in `css/style.css`
- Create new JavaScript functionality in the `js/` folder
- Update `js/app.js` to coordinate new features

## ❤️ Made with Love

This website was built with care to support someone special through their LSAT journey. Good luck! 🍀

---

## License

This project is free to use and modify for personal purposes. Feel free to share and adapt it for others studying for the LSAT!
