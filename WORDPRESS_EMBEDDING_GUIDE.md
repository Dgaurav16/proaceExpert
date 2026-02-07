# WordPress Embedding Guide for CricProAce

## Overview

This guide explains how to embed CricProAce prediction features into your WordPress website. You can embed individual tournaments, match cards, leaderboards, and prediction forms.

## Prerequisites

- Your CricProAce site is published and accessible at a public URL
- WordPress site with admin access
- Basic understanding of WordPress posts/pages

## Method 1: Using iframes (Recommended)

iframes are the easiest and most reliable way to embed your prediction platform into WordPress.

### A. Embed a Tournament Page

Add this code to any WordPress post or page using the HTML block:

```html
<iframe 
  src="https://your-cricproace-site.replit.app/tournaments/1" 
  width="100%" 
  height="800" 
  frameborder="0" 
  style="border: none; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
</iframe>
```

**Replace:**
- `your-cricproace-site.replit.app` with your actual published site URL
- `1` with the tournament ID you want to embed

### B. Embed the Full Tournaments List

```html
<iframe 
  src="https://your-cricproace-site.replit.app/tournaments" 
  width="100%" 
  height="1000" 
  frameborder="0" 
  style="border: none;">
</iframe>
```

### C. Embed the Leaderboard

```html
<iframe 
  src="https://your-cricproace-site.replit.app/leaderboard" 
  width="100%" 
  height="900" 
  frameborder="0" 
  style="border: none;">
</iframe>
```

### D. Embed a Specific Match

```html
<iframe 
  src="https://your-cricproace-site.replit.app/matches/5" 
  width="100%" 
  height="700" 
  frameborder="0" 
  style="border: none;">
</iframe>
```

**Replace `5` with your actual match ID**

---

## Method 2: WordPress Shortcode (Advanced)

If you want reusable shortcodes, add this to your theme's `functions.php`:

### Step 1: Add Shortcode Functions

```php
<?php
// CricProAce Embedding Shortcodes

// Shortcode for tournaments
function cricproace_tournament_shortcode($atts) {
    $atts = shortcode_atts(array(
        'id' => '',
        'height' => '800',
        'url' => 'https://your-cricproace-site.replit.app'
    ), $atts);
    
    $src = $atts['id'] ? $atts['url'] . '/tournaments/' . $atts['id'] : $atts['url'] . '/tournaments';
    
    return '<iframe src="' . esc_url($src) . '" width="100%" height="' . esc_attr($atts['height']) . '" frameborder="0" style="border: none; border-radius: 8px;"></iframe>';
}
add_shortcode('cricproace_tournament', 'cricproace_tournament_shortcode');

// Shortcode for leaderboard
function cricproace_leaderboard_shortcode($atts) {
    $atts = shortcode_atts(array(
        'height' => '900',
        'url' => 'https://your-cricproace-site.replit.app'
    ), $atts);
    
    return '<iframe src="' . esc_url($atts['url'] . '/leaderboard') . '" width="100%" height="' . esc_attr($atts['height']) . '" frameborder="0" style="border: none;"></iframe>';
}
add_shortcode('cricproace_leaderboard', 'cricproace_leaderboard_shortcode');

// Shortcode for matches
function cricproace_match_shortcode($atts) {
    $atts = shortcode_atts(array(
        'id' => '',
        'height' => '700',
        'url' => 'https://your-cricproace-site.replit.app'
    ), $atts);
    
    if (empty($atts['id'])) {
        return '<p>Please provide a match ID</p>';
    }
    
    return '<iframe src="' . esc_url($atts['url'] . '/matches/' . $atts['id']) . '" width="100%" height="' . esc_attr($atts['height']) . '" frameborder="0" style="border: none;"></iframe>';
}
add_shortcode('cricproace_match', 'cricproace_match_shortcode');
?>
```

### Step 2: Use Shortcodes in WordPress

After adding the code above, you can use these shortcodes in any post or page:

**Embed All Tournaments:**
```
[cricproace_tournament]
```

**Embed Specific Tournament:**
```
[cricproace_tournament id="1"]
```

**Embed Leaderboard:**
```
[cricproace_leaderboard]
```

**Embed Specific Match:**
```
[cricproace_match id="5"]
```

**Custom Height:**
```
[cricproace_tournament id="2" height="1000"]
```

---

## Method 3: Using WordPress Gutenberg Blocks

1. In WordPress editor, click **+** to add a block
2. Search for **"Custom HTML"** block
3. Paste the iframe code from Method 1
4. Preview and publish

---

## Security Considerations

### Your CricProAce Site Already Has:

✅ **X-Frame-Options Protection** - Your site is configured to allow embedding
✅ **CORS Configuration** - Cross-origin requests are handled securely
✅ **Session Management** - User authentication works within iframes

### WordPress Security:

1. **Use HTTPS**: Make sure both your WordPress site and CricProAce site use HTTPS
2. **Content Security Policy**: If your WordPress site has strict CSP, add your CricProAce domain:
   ```
   frame-src 'self' https://your-cricproace-site.replit.app;
   ```

---

## Responsive Design Tips

### Make iframes Responsive:

Wrap your iframe in a responsive container:

```html
<div style="position: relative; padding-bottom: 75%; height: 0; overflow: hidden;">
  <iframe 
    src="https://your-cricproace-site.replit.app/tournaments" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
    frameborder="0">
  </iframe>
</div>
```

This maintains a 4:3 aspect ratio on all screen sizes.

---

## Styling the Embedded Content

### Add Custom CSS in WordPress:

Go to **Appearance → Customize → Additional CSS** and add:

```css
/* Style embedded CricProAce iframes */
.cricproace-embed {
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    margin: 20px 0;
}

.cricproace-embed iframe {
    display: block;
}
```

Then use the class in your iframe:

```html
<div class="cricproace-embed">
  <iframe src="..." width="100%" height="800" frameborder="0"></iframe>
</div>
```

---

## Finding IDs for Embedding

### Tournament IDs
1. Go to your CricProAce site
2. Navigate to a tournament page
3. The URL will be: `https://your-site.replit.app/tournaments/12`
4. The number `12` is the tournament ID

### Match IDs
1. Go to your CricProAce admin dashboard
2. Click "Manage Matches"
3. The match ID is shown in the matches list
4. Or check the URL when viewing a match: `/matches/5` → ID is `5`

---

## Common Use Cases

### 1. Cricket Blog with Live Predictions
Embed tournament pages into blog posts about upcoming cricket series:

```
[cricproace_tournament id="1"]
```

### 2. Sidebar Leaderboard Widget
Create a custom HTML widget with the leaderboard iframe:

```html
<iframe 
  src="https://your-cricproace-site.replit.app/leaderboard" 
  width="100%" 
  height="500" 
  frameborder="0"
  style="border: none;">
</iframe>
```

### 3. Match Preview Pages
Create individual pages for each match with embedded prediction forms:

```
[cricproace_match id="10"]
```

---

## Troubleshooting

### Issue: "This content cannot be displayed in a frame"

**Solution:** Make sure your CricProAce site's security headers allow iframe embedding. The site is already configured correctly, so this shouldn't happen.

### Issue: iframe shows but content is cut off

**Solution:** Increase the `height` attribute:
```html
height="1200"
```

### Issue: Users can't log in within iframe

**Solution:** This is expected behavior. Users should:
1. Open your CricProAce site in a new tab to log in
2. Return to the WordPress page - they'll be logged in

Or add a link above the iframe:
```html
<p><a href="https://your-cricproace-site.replit.app" target="_blank">Login to CricProAce</a></p>
<iframe src="..." ></iframe>
```

### Issue: Shortcodes not working

**Solution:** Make sure you:
1. Added the code to your active theme's `functions.php`
2. Saved the file
3. Cleared WordPress cache (if using caching plugin)

---

## Advanced: Custom Integration with WordPress REST API

If you want to pull data from CricProAce into WordPress (rather than embedding), you can:

1. Create API endpoints in your CricProAce site
2. Use WordPress's HTTP API to fetch data
3. Display using custom WordPress templates

**Example:**
```php
<?php
$response = wp_remote_get('https://your-cricproace-site.replit.app/api/tournaments');
$tournaments = json_decode(wp_remote_retrieve_body($response), true);
foreach ($tournaments as $tournament) {
    echo '<h3>' . esc_html($tournament['name']) . '</h3>';
}
?>
```

---

## Support

For issues with:
- **Embedding functionality**: Check this guide
- **CricProAce features**: Contact your CricProAce admin
- **WordPress issues**: Consult WordPress documentation

---

## Quick Reference

| What to Embed | Shortcode | Direct URL |
|---------------|-----------|------------|
| All Tournaments | `[cricproace_tournament]` | `/tournaments` |
| Specific Tournament | `[cricproace_tournament id="1"]` | `/tournaments/1` |
| Leaderboard | `[cricproace_leaderboard]` | `/leaderboard` |
| Specific Match | `[cricproace_match id="5"]` | `/matches/5` |
| Home Page | N/A | `/` |

---

**Remember**: Replace `https://your-cricproace-site.replit.app` with your actual published site URL!
