

## Update Error Messages for Hospital Firewall Awareness

### Problem
When the hospital firewall blocks requests to `rotdapktuwxwvylhnfry.functions.supabase.co`, users see generic error messages like "Failed to process file" or "Network error. Please check your internet connection" -- which don't help them understand the actual issue.

### Changes

**1. `src/components/EnhancedFileUpload.tsx` (line 318-319)**
Update the network error message to mention firewall whitelisting:

```
'Network error: Your firewall may be blocking access to the processing server. '
+ 'Please ask IT to whitelist "rotdapktuwxwvylhnfry.functions.supabase.co" on port 443. '
+ 'If the issue persists, check your internet connection.'
```

**2. `src/components/FileUpload.tsx` (lines 102-106)**
Replace the generic catch block error with network-aware detection:

```typescript
} catch (err) {
  const errMsg = err instanceof Error ? err.message : '';
  const isNetworkError = errMsg.includes('Failed to fetch') || errMsg.includes('NetworkError');
  const errorMessage = isNetworkError
    ? 'Network error: Your firewall may be blocking access to the processing server. '
      + 'Please ask IT to whitelist "rotdapktuwxwvylhnfry.functions.supabase.co" on port 443. '
      + 'If the issue persists, check your internet connection.'
    : 'Failed to process file. Please try again.';
  setError(errorMessage);
  toast({
    title: "Processing Error",
    description: errorMessage,
    variant: "destructive",
  });
}
```

### Summary
- Two files modified with better error messages
- Network/firewall errors now include the exact domain to whitelist
- Non-network errors keep their original generic messages

