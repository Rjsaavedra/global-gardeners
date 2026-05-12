update public.growmate_messages
set content = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed neque felis, tincidunt placerat lectus euismod, accumsan dapibus orci. Sed felis orci, consequat eget mi quis, facilisis facilisis metus.'
where role = 'assistant'
  and btrim(content) = 'Care Plan';
