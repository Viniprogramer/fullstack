import {PrismaClient} from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma=new PrismaClient();
const images=[
"https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=85",
"https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1000&q=85",
"https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=85",
"https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=85",
"https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1000&q=85",
"https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=85"
];
async function main(){
 await prisma.booking.deleteMany();await prisma.favorite.deleteMany();await prisma.property.deleteMany();await prisma.user.deleteMany();
 const password=await bcrypt.hash("123456",10);
 const demo=await prisma.user.create({data:{name:"Vinícius Ferreira",email:"demo@stayly.dev",password,role:"HOST",avatar:"https://i.pravatar.cc/150?img=12"}});
 const guest=await prisma.user.create({data:{name:"Ana Martins",email:"ana@stayly.dev",password,role:"CUSTOMER",avatar:"https://i.pravatar.cc/150?img=47"}});
 const data=[
  ["Casa Horizonte","Petrópolis","RJ",680,6,3,4,"Montanha","Uma casa contemporânea cercada de verde, com vista para as montanhas e espaços pensados para desacelerar."],
  ["Apartamento Lumi","São Paulo","SP",420,4,2,2,"Design","Apartamento de design no coração da cidade, com luz natural, cozinha completa e uma vista incrível."],
  ["Refúgio do Vale","Teresópolis","RJ",550,5,2,3,"Cabana","Refúgio aconchegante entre montanhas, perfeito para finais de semana tranquilos e experiências a dois."],
  ["Casa Maré Alta","Arraial do Cabo","RJ",890,8,4,5,"Praia","Casa espaçosa perto do mar com varanda, piscina e ambientes abertos para reunir a família."],
  ["Loft Jardim","Rio de Janeiro","RJ",390,3,1,1,"Cidade","Loft elegante em uma rua tranquila, próximo aos melhores cafés, restaurantes e praias."],
  ["Villa Serena","Paraty","RJ",760,7,3,4,"Design","Arquitetura brasileira, jardim tropical e interiores acolhedores a poucos minutos do centro histórico."]
 ];
 for(let i=0;i<data.length;i++){
  const [title,city,state,price,guests,bedrooms,beds,category,description]=data[i] as any;
  await prisma.property.create({data:{title,city,state,price,guests,bedrooms,beds,category,description,image:images[i],rating:4.7+(i%3)/10,reviews:34+i*17,hostId:demo.id}});
 }
 const first=await prisma.property.findFirst({where:{title:"Casa Horizonte"}});if(first)await prisma.favorite.create({data:{userId:guest.id,propertyId:first.id}});
 console.log("Seed concluído. demo@stayly.dev / 123456");
}
main().catch(console.error).finally(()=>prisma.$disconnect());