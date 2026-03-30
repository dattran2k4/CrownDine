package com.crowndine.common.i18n;

import java.util.Locale;

public interface MessageService {
    String getMessage(String key, Object... args);

    String getMessage(String key, Locale locale, Object... args);

    String resolveMessageOrKey(String keyOrMessage, Object... args);

    String resolveMessageOrKey(String keyOrMessage, Locale locale, Object... args);
}
