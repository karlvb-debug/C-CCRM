import { supabase } from './supabase';

/**
 * Attempts to match a form submission to an existing client by email or phone.
 * If a match is found, updates the submission's matched_client_id.
 * If no match, creates a new client record and links it.
 * 
 * @param {number} submissionId - The form_submissions row id
 * @param {object} data - The raw submission data (JSONB)
 * @returns {object|null} - The matched or newly-created client
 */
export async function matchOrCreateClient(submissionId, data) {
  const email = data.email || data.Email || '';
  const phone = data.phone || data.Phone || data['Phone Number'] || '';
  const name = data.name || data.Name || data['Full Name'] || 'Unknown';

  if (!email && !phone) return null;

  // 1. Try to match existing client
  let existingClient = null;

  if (email) {
    const { data: byEmail } = await supabase
      .from('clients')
      .select('*')
      .ilike('email', email)
      .limit(1)
      .single();
    if (byEmail) existingClient = byEmail;
  }

  if (!existingClient && phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    const { data: byPhone } = await supabase
      .from('clients')
      .select('*')
      .limit(100);
    if (byPhone) {
      existingClient = byPhone.find(c => c.phone && c.phone.replace(/\D/g, '') === cleanPhone) || null;
    }
  }

  let clientId = existingClient?.id;

  // 2. If no match, create a new client
  if (!existingClient) {
    // Detect consent from checkbox-like fields
    const hasConsent = !!(data.agreement || data.Agreement || data.consent || data.sms_consent);
    const consentValue = hasConsent ? 'opt_in' : 'neutral';
    const interests = data.interests || data.interest || data.Interests || data.Interest || null;

    const { data: newClient, error } = await supabase
      .from('clients')
      .insert([{
        name: name.trim(),
        email: email || null,
        phone: phone || null,
        person_type: 'adult',
        sms_consent: consentValue,
        email_consent: consentValue,
        interests: interests,
        total_sales: 0
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating client from submission:', error);
      return null;
    }
    clientId = newClient.id;
    existingClient = newClient;
  }

  // 3. Link submission to client
  await supabase
    .from('form_submissions')
    .update({ matched_client_id: clientId })
    .eq('id', submissionId);

  return existingClient;
}
