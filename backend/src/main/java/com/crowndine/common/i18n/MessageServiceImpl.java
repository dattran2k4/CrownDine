package com.crowndine.common.i18n;

import lombok.RequiredArgsConstructor;
import org.springframework.context.MessageSource;
import org.springframework.context.NoSuchMessageException;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class MessageServiceImpl implements MessageService {

    private final MessageSource messageSource;

    @Override
    public String getMessage(String key, Object... args) {
        return getMessage(key, LocaleContextHolder.getLocale(), args);
    }

    @Override
    public String getMessage(String key, Locale locale, Object... args) {
        return messageSource.getMessage(key, args, locale);
    }

    @Override
    public String resolveMessageOrKey(String keyOrMessage, Object... args) {
        return resolveMessageOrKey(keyOrMessage, LocaleContextHolder.getLocale(), args);
    }

    @Override
    public String resolveMessageOrKey(String keyOrMessage, Locale locale, Object... args) {
        if (keyOrMessage == null || keyOrMessage.isBlank()) {
            return keyOrMessage;
        }

        try {
            return messageSource.getMessage(keyOrMessage, args, locale);
        } catch (NoSuchMessageException ignored) {
            return keyOrMessage;
        }
    }
}
