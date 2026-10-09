package nl.droomwereld.app;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.webkit.ValueCallback;
import android.webkit.WebSettings;
import android.webkit.WebView;

/**
 * De hele app: een schermvullende WebView die het spel (assets/index.html) offline laat zien.
 * Bewust zonder lambda's en zonder AndroidX, zodat het met de eenvoudige bouwketen in build.sh werkt.
 */
public class MainActivity extends Activity {
    private static final int FEATURE_NO_TITLE = 1;
    private static final int FLAG_FULLSCREEN = 0x00000400;
    private static final int FLAG_KEEP_SCREEN_ON = 0x00000080;
    // LAYOUT_STABLE | LAYOUT_HIDE_NAVIGATION | LAYOUT_FULLSCREEN | HIDE_NAVIGATION | FULLSCREEN | IMMERSIVE_STICKY
    private static final int IMMERSIVE = 0x00000100 | 0x00000200 | 0x00000400 | 0x00000002 | 0x00000004 | 0x00001000;

    // Terugknop: tijdens een level het pauzescherm openen (zoals Escape), anders de app sluiten.
    private static final String BACK_JS =
        "(function(){try{var s=window.DW&&DW.debug&&DW.debug.state();" +
        "if(s==='PLAYING'){window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape'}));return 'game';}" +
        "}catch(e){}return 'exit';})()";

    private WebView web;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        requestWindowFeature(FEATURE_NO_TITLE);
        getWindow().addFlags(FLAG_FULLSCREEN | FLAG_KEEP_SCREEN_ON);

        web = new WebView(this);
        web.setBackgroundColor(0xFF070722);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);                    // voortgang bewaren (localStorage)
        s.setMediaPlaybackRequiresUserGesture(false);    // geluid (Web Audio)
        setContentView(web);
        hideSystemBars();
        if (state != null) web.restoreState(state);
        else web.loadUrl("file:///android_asset/index.html");
    }

    private void hideSystemBars() {
        getWindow().getDecorView().setSystemUiVisibility(IMMERSIVE);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) hideSystemBars();
    }

    @Override
    public void onBackPressed() {
        web.evaluateJavascript(BACK_JS, new ValueCallback<String>() {
            @Override
            public void onReceiveValue(String v) {
                if (v == null || !v.contains("game")) finish();
            }
        });
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onPause() {
        super.onPause();
        web.onPause();   // geluid en animatie stoppen als de app op de achtergrond gaat
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
        hideSystemBars();
    }

    @Override
    protected void onDestroy() {
        if (web != null) web.destroy();
        super.onDestroy();
    }
}
