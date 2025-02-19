import { Model } from 'mongoose';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { IPokeResponse } from './interfaces/poke-response.interface';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) {}

  async execute() {
    await this.pokemonModel.deleteMany({});

    const data = await this.http.get<IPokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=350',
    );

    const pokemonToInsert: { name: string; no: number }[] = [];

    data.results.forEach(async ({ name, url }) => {
      const segments = url.split('/');
      const no: number = +segments[segments.length - 2];

      pokemonToInsert.push({ name, no });
    });

    this.pokemonModel.insertMany(pokemonToInsert);

    return 'Seed Executed Successfully';
  }
}
