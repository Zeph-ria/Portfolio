-- ============================================================
-- StylIA — Textile knowledge base seed (7 core fabrics)
-- iron_temp in °C (dot •, ••, ••• conventions map at UI level)
-- wash_shrinkage as % of linear dimension after first wash
-- ============================================================

INSERT OR REPLACE INTO textiles
  (slug, name_fr, name_en, name_es, drape_type, wash_shrinkage, iron_temp, tips_fr, tips_en, tips_es)
VALUES
  ('cotton', 'Coton', 'Cotton', 'Algodón', 'rigid', 3.0, 200,
   'Prélavez toujours à 40°C avant la coupe. Repassez sur l''envers légèrement humide pour un tombé net.',
   'Always pre-wash at 40°C before cutting. Press slightly damp on the reverse side for a crisp finish.',
   'Lave siempre a 40°C antes de cortar. Planche ligeramente húmedo por el revés para un acabado nítido.'),

  ('linen', 'Lin', 'Linen', 'Lino', 'rigid', 4.0, 230,
   'Le lin se froisse noblement : repassez à haute température avec beaucoup de vapeur. Coupez dans le droit-fil strict.',
   'Linen creases nobly: iron hot with plenty of steam. Cut strictly on the straight grain.',
   'El lino se arruga con nobleza: planche a alta temperatura con mucho vapor. Corte estrictamente al hilo.'),

  ('silk', 'Soie', 'Silk', 'Seda', 'fluid', 2.0, 150,
   'Épinglez dans les marges uniquement. Stabilisez avec du papier de soie sous le tissu pendant la coupe.',
   'Pin inside seam allowances only. Stabilise with tissue paper under the fabric while cutting.',
   'Coloque alfileres solo en los márgenes. Estabilice con papel de seda bajo la tela durante el corte.'),

  ('viscose', 'Viscose', 'Viscose', 'Viscosa', 'fluid', 5.0, 150,
   'Très mobile : laissez reposer le tissu 24h à plat avant la coupe et utilisez un contre-papier de soie.',
   'Very shifty: let the fabric rest flat for 24h before cutting and back it with tissue paper.',
   'Muy inestable: deje reposar la tela 24h en plano antes de cortar y refuércela con papel de seda.'),

  ('polyester', 'Polyester', 'Polyester', 'Poliéster', 'fluid', 0.5, 130,
   'Craint la chaleur : fer doux avec pattemouille. Testez toujours la température sur une chute.',
   'Heat-sensitive: use a cool iron with a press cloth. Always test the temperature on a scrap.',
   'Sensible al calor: plancha suave con paño protector. Pruebe siempre la temperatura en un retal.'),

  ('wool', 'Laine', 'Wool', 'Lana', 'rigid', 3.5, 160,
   'Décatissez à la vapeur avant la coupe. Repassez avec pattemouille, sans écraser la fibre.',
   'Steam-shrink (decatize) before cutting. Press with a cloth without crushing the fibre.',
   'Desencoja al vapor antes de cortar. Planche con paño sin aplastar la fibra.'),

  ('denim', 'Denim', 'Denim', 'Denim', 'rigid', 3.0, 200,
   'Prélavez deux fois pour fixer l''indigo et le retrait. Aiguille jeans 100/16 et surpiqûres au fil épais.',
   'Pre-wash twice to set indigo and shrinkage. Use a 100/16 jeans needle and topstitch with heavy thread.',
   'Lave dos veces para fijar el índigo y el encogimiento. Aguja para vaqueros 100/16 y pespuntes con hilo grueso.');
