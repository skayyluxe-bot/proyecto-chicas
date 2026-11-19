import type { Makeup } from '../domain/types'

const natural = `${import.meta.env.BASE_URL}images/makeup-natural-realista.png`
const glam = `${import.meta.env.BASE_URL}images/makeup-glam-realista.png`

export const makeups: Makeup[] = [
  { id: 'mk-cumpleanos-natural', nombre: 'Rosa de cumpleaños', descripcion: 'Rubor rosado, párpados suaves y labios con brillo transparente para una celebración de día.', ocasiones: ['cumpleanos'], intensidad: 'natural', imagen: natural },
  { id: 'mk-cumpleanos-glam', nombre: 'Brillo de celebración', descripcion: 'Sombras champán, delineado definido y labios frambuesa para destacar en tu cumpleaños.', ocasiones: ['cumpleanos'], intensidad: 'glam', imagen: glam },
  { id: 'mk-fiesta-natural', nombre: 'Luz de noche', descripcion: 'Tonos tierra difuminados, pestañas ligeras y labios nude para un acabado discreto.', ocasiones: ['fiesta'], intensidad: 'natural', imagen: natural },
  { id: 'mk-fiesta-glam', nombre: 'Mirada de fiesta', descripcion: 'Sombras ahumadas, delineado negro y labios ciruela para una mirada protagonista.', ocasiones: ['fiesta'], intensidad: 'glam', imagen: glam },
  { id: 'mk-cena-natural', nombre: 'Elegancia suave', descripcion: 'Sombras beige mate, rubor durazno y labios rosados para una cena formal.', ocasiones: ['cena_formal'], intensidad: 'natural', imagen: natural },
  { id: 'mk-cena-glam', nombre: 'Labios clásicos', descripcion: 'Delineado fino, sombras satinadas y labios rojos para acompañar prendas de líneas clásicas.', ocasiones: ['cena_formal'], intensidad: 'glam', imagen: glam },
  { id: 'mk-casual-natural', nombre: 'Frescura cotidiana', descripcion: 'Rubor ligero, máscara de pestañas y bálsamo con color para una salida relajada.', ocasiones: ['salida_casual'], intensidad: 'natural', imagen: natural },
  { id: 'mk-casual-glam', nombre: 'Toque de color', descripcion: 'Delineado oliva y labios terracota para añadir expresión a un conjunto casual.', ocasiones: ['salida_casual'], intensidad: 'glam', imagen: glam },
  { id: 'mk-graduacion-natural', nombre: 'Retrato luminoso', descripcion: 'Tonos neutros, rubor suave y labios rosa para un estilo delicado de graduación.', ocasiones: ['graduacion'], intensidad: 'natural', imagen: natural },
  { id: 'mk-graduacion-glam', nombre: 'Noche de graduación', descripcion: 'Sombras bronce, pestañas definidas y labios malva para una celebración especial.', ocasiones: ['graduacion'], intensidad: 'glam', imagen: glam },
]
