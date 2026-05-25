package com.desirebank.app;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {
  private static final int FILE_CHOOSER_REQUEST_CODE = 1001;

  private WebView webView;
  private ValueCallback<Uri[]> filePathCallback;

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR);

    webView = new WebView(this);
    setContentView(webView);

    WebSettings settings = webView.getSettings();
    settings.setJavaScriptEnabled(true);
    settings.setDomStorageEnabled(true);
    settings.setDatabaseEnabled(true);
    settings.setAllowFileAccess(true);
    settings.setAllowContentAccess(true);

    webView.setWebChromeClient(new WebChromeClient() {
      @Override
      public boolean onShowFileChooser(
        WebView webView,
        ValueCallback<Uri[]> filePathCallback,
        FileChooserParams fileChooserParams
      ) {
        if (MainActivity.this.filePathCallback != null) {
          MainActivity.this.filePathCallback.onReceiveValue(null);
        }

        MainActivity.this.filePathCallback = filePathCallback;

        Intent intent = fileChooserParams.createIntent();
        try {
          startActivityForResult(intent, FILE_CHOOSER_REQUEST_CODE);
        } catch (Exception error) {
          MainActivity.this.filePathCallback = null;
          return false;
        }

        return true;
      }
    });
    webView.setWebViewClient(new WebViewClient());
    webView.loadUrl("file:///android_asset/www/index.html");
  }

  @Override
  protected void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);

    if (requestCode != FILE_CHOOSER_REQUEST_CODE || filePathCallback == null) {
      return;
    }

    Uri[] result = WebChromeClient.FileChooserParams.parseResult(resultCode, data);
    filePathCallback.onReceiveValue(result);
    filePathCallback = null;
  }

  @Override
  public void onBackPressed() {
    if (webView != null && webView.canGoBack()) {
      webView.goBack();
      return;
    }
    super.onBackPressed();
  }
}
