export const eventNames=['page_view','cta_clicked','signup_started','signup_completed','login_completed','logout_completed','pricing_viewed','checkout_started','checkout_completed','subscription_started','subscription_renewed','subscription_cancelled','lead_created','referral_created','referral_converted'] as const;
export type EventName=typeof eventNames[number];
