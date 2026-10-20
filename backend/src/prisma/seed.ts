import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const RECIPES = [
  { id: 'v60-equilibrada', method: 'v60', nome: 'V60 Equilibrada', foco: 'Doçura e corpo médio', moagem: 'padrão', baseDose: 20, tempoTotalEstimado: 150, fases: [{ id: 'v60-equilibrada-1', nome: 'Bloom', tempoObjetivo: 30, volumeAgua: 40, descricao: 'Despeje 40g de água em círculos suaves e aguarde 30s.' }, { id: 'v60-equilibrada-2', nome: 'Vertida Principal', tempoObjetivo: 75, volumeAgua: 160, descricao: 'Adicione água até 160g e aguarde até 1m15s.' }, { id: 'v60-equilibrada-3', nome: 'Finalização', tempoObjetivo: 150, volumeAgua: 300, descricao: 'Adicione até 300g e aguarde a extração terminar.' }] },
  { id: 'v60-intensa', method: 'v60', nome: 'V60 Intensa', foco: 'Acidez e brilho', moagem: 'levemente mais fina', baseDose: 20, tempoTotalEstimado: 125, fases: [{ id: 'v60-intensa-1', nome: 'Bloom', tempoObjetivo: 40, volumeAgua: 50, descricao: 'Despeje 50g de água e aguarde 40s.' }, { id: 'v60-intensa-2', nome: 'Vertida Única', tempoObjetivo: 90, volumeAgua: 300, descricao: 'Adicione o restante da água (até 300g) de forma constante e circular até 1m30s.' }, { id: 'v60-intensa-3', nome: 'Decantação', tempoObjetivo: 125, volumeAgua: 300, descricao: 'Deixe fluir até finalizar.' }] },
  { id: 'v60-suave', method: 'v60', nome: 'V60 Suave', foco: 'Doçura prolongada', moagem: 'um pouco mais grossa', baseDose: 20, tempoTotalEstimado: 180, fases: [{ id: 'v60-suave-1', nome: 'Bloom', tempoObjetivo: 30, volumeAgua: 40, descricao: 'Despeje 40g de água e aguarde 30s.' }, { id: 'v60-suave-2', nome: '1ª Vertida', tempoObjetivo: 60, volumeAgua: 150, descricao: 'Adicione até 150g e aguarde 30s.' }, { id: 'v60-suave-3', nome: '2ª Vertida', tempoObjetivo: 90, volumeAgua: 225, descricao: 'Adicione até 225g e aguarde 30s.' }, { id: 'v60-suave-4', nome: 'Finalização', tempoObjetivo: 180, volumeAgua: 300, descricao: 'Adicione até 300g e aguarde a extração terminar.' }] },
];

async function main() {
  for (const r of RECIPES) {
    await prisma.guide.upsert({ where: { id: r.id }, update: { ...r }, create: { ...r } });
  }
  console.log('Seeded 3 guides');
}
main().finally(() => prisma.$disconnect());
