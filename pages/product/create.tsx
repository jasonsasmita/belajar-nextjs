import { WithDefaultLayout } from '@/components/DefautLayout';
import { Title } from '@/components/Title';
import { Page } from '@/types/Page';
import { z } from 'zod';
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitButton } from '@/components/SubmitButton';
import { BelajarNextJsBackEndClient, Brand } from '@/functions/swagger/BelajarNextJsBackEnd';
import Link from 'next/link';
import { InputText } from '@/components/FormControl';
import { Select, Spin } from 'antd';
import { useState } from 'react';
import useSwr from 'swr';
import { useSwrFetcherWithAccessToken } from '@/functions/useSwrFetcherWithAccessToken';
import debounce from 'lodash.debounce';

// C- Create
// R- Read
// U- Update
// D- Delete

const FormSchema = z.object({
    name: z.string().nonempty({
        message: 'Nama tidak boleh kosong'
    }),
    description: z.string().nonempty({
        message: 'Description tidak boleh kosong'
    }),
    price: z.number({invalid_type_error : 'Price tidak boleh kosong' }).gte(1000,{message: 'Price harus lebih besar dari Rp 1000'}),
    quantity: z.number({invalid_type_error : 'Quantity tidak boleh kosong' }).gte(1,{message: 'Quantity harus paling tidak dari 1'}),
    brandId: z.string({required_error: 'Product tidak boleh kosong' }).nonempty({
        message: 'Product tidak boleh kosong'
    }),
});

type FormDataType = z.infer<typeof FormSchema>;

const IndexPage: Page = () => {

    const {
        handleSubmit,
        register,
        formState: { errors },
        reset,
        control
    } = useForm<FormDataType>({
        resolver: zodResolver(FormSchema)
    });

    async function onSubmit(data: FormDataType) {
        // console.log(data);

        try {
            const client = new BelajarNextJsBackEndClient('http://localhost:3000/api/be');
            await client.createProduct({
                name: data.name,
                description : data.description,
                price: data.price,
                quantity: data.quantity,
                brandId: data.brandId
            });
            reset();
        } catch (error) {
            console.error(error);
        }
    }

    const [search, setSearch] = useState('');
    const params = new URLSearchParams();
    params.append('search', search);
    const BrandsUri = '/api/be/api/Brands?' + params.toString();
    const fetcher = useSwrFetcherWithAccessToken();
    const { data, isLoading, isValidating } = useSwr<Brand[]>(BrandsUri, fetcher);

    const setSearchDebounced = debounce((t: string) => setSearch(t), 300);

    const options = data?.map(Q => {
        return {
            label: Q.name,
            value: Q.id
        };
    }) ?? [];

    return (
        <div>
            <Title>Create New Product</Title>
            <Link href='/product'>Return to Index</Link>

            <h2 className='mb-5 text-3xl'>Create New Product</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
                <div>
                    <label htmlFor='name'>Name</label>
                    <InputText id='name' {...register('name')}></InputText>
                    <p className='text-red-500'>{errors['name']?.message}</p>
                </div>
                <div>
                    <label htmlFor='description'>Description</label>
                    <InputText id='description' {...register('description')} ></InputText>
                    <p className='text-red-500'>{errors['description']?.message}</p>
                </div>
                <div>
                    <label htmlFor='price'>Price</label>
                    <InputText id='description' {...register('price',{valueAsNumber:true})}></InputText>
                    <p className='text-red-500'>{errors['price']?.message}</p>
                </div>
                <div>
                    <label htmlFor='quantity'>Quantity</label>
                    <InputText id='description' {...register('quantity',{valueAsNumber:true})}></InputText>
                    <p className='text-red-500'>{errors['quantity']?.message}</p>
                </div>
                <div className='mt-5'>
                    <label htmlFor='brand'>Brand</label>
                    <Controller
                        control={control}
                        name='brandId'
                        render={({ field }) => (
                            <Select
                                className='block'
                                showSearch
                                optionFilterProp="children"
                                {...field}
                                onSearch={t => setSearchDebounced(t)}
                                options={options}
                                filterOption={false}
                                notFoundContent={(isLoading || isValidating) ? <Spin size="small" /> : null}
                            />
                        )}
                    ></Controller>

                    <p className='text-red-500'>{errors['brandId']?.message}</p>
                </div>
                <div className='mt-5'>
                    <SubmitButton>Submit</SubmitButton>
                </div>
            </form>
        </div>
    );
}

IndexPage.layout = WithDefaultLayout;
export default IndexPage;