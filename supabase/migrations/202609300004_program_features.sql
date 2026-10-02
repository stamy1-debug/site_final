BEGIN;
-- Owner-supplied program benefits. These are access identifiers, not fabricated lesson content.
INSERT INTO public.features(key,description) VALUES
 ('curriculum_materials','Materiale pentru materia de examen'),('lesson_recordings','Înregistrările întâlnirilor incluse'),
 ('weekly_lesson','Întâlnirea săptămânală'),('homework_feedback','Corectarea temelor'),
 ('starter_community','Comunitatea STARTER'),('personal_development','Ședința lunară de dezvoltare personală'),
 ('extra_practice','Întâlnirea suplimentară de practică'),('mentor_support','Mentor dedicat'),
 ('pro_elite_community','Comunitatea PRO și ELITE'),('study_plan','Plan personalizat de studiu'),
 ('monthly_mock_exam','Simulare lunară corectată cu rezolvare video'),('priority_support','Suport prioritar'),
 ('independent_community','Grupul de clarificări Elevul independent') ON CONFLICT(key) DO NOTHING;
INSERT INTO public.plan_features(plan_id,feature_key)
SELECT p.id,f FROM public.plans p CROSS JOIN unnest(ARRAY['curriculum_materials','lesson_recordings','weekly_lesson','homework_feedback','starter_community','personal_development']) f WHERE p.code IN ('STARTER','PRO','ELITE') ON CONFLICT DO NOTHING;
INSERT INTO public.plan_features(plan_id,feature_key)
SELECT p.id,f FROM public.plans p CROSS JOIN unnest(ARRAY['extra_practice','mentor_support','pro_elite_community']) f WHERE p.code IN ('PRO','ELITE') ON CONFLICT DO NOTHING;
INSERT INTO public.plan_features(plan_id,feature_key)
SELECT p.id,f FROM public.plans p CROSS JOIN unnest(ARRAY['study_plan','premium_content','monthly_mock_exam']) f WHERE p.code IN ('ELITE','INDEPENDENT') ON CONFLICT DO NOTHING;
INSERT INTO public.plan_features(plan_id,feature_key) SELECT id,'priority_support' FROM public.plans WHERE code='ELITE' ON CONFLICT DO NOTHING;
INSERT INTO public.plan_features(plan_id,feature_key) SELECT id,'independent_community' FROM public.plans WHERE code='INDEPENDENT' ON CONFLICT DO NOTHING;
-- Earlier generic scaffolding is retained for migration compatibility but is not offered.
UPDATE public.plans SET active=false WHERE code IN ('PREMIUM','PREMIUM_PLUS');
COMMIT;
